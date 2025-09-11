import React from 'react';
import { useCache } from '@/contexts/CacheContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

// Optimistic update utilities for better UX
export const useOptimisticUpdates = () => {
  const { isOnline, queueOfflineOperation } = useCache();
  const queryClient = useQueryClient();

  const optimisticUpdate = React.useCallback(
    <T>(
      queryKey: string[],
      updateFn: (oldData: T) => T,
      rollbackFn?: (oldData: T) => T
    ) => {
      // Store the previous data for potential rollback
      const previousData = queryClient.getQueryData<T>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (oldData: T) => {
        if (!oldData) return oldData;
        const newData = updateFn(oldData);
        logger.debug('Optimistic update applied', { queryKey, hasRollback: !!rollbackFn });
        return newData;
      });

      return {
        rollback: () => {
          if (previousData && rollbackFn) {
            queryClient.setQueryData(queryKey, rollbackFn(previousData));
            logger.debug('Optimistic update rolled back', { queryKey });
          } else if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
        },
        previousData,
      };
    },
    [queryClient]
  );

  const optimisticMutation = React.useCallback(
    <TData, TVariables>(
      mutationFn: (variables: TVariables) => Promise<TData>,
      options: {
        onMutate?: (variables: TVariables) => any;
        onError?: (error: Error, variables: TVariables, context: any) => void;
        onSuccess?: (data: TData, variables: TVariables, context: any) => void;
        onSettled?: () => void;
        queryKey?: string[];
        offlineOperation?: {
          table: string;
          operation: 'create' | 'update' | 'delete';
          data: any;
        };
      }
    ) => {
      return useMutation({
        mutationFn: async (variables: TVariables) => {
          if (!isOnline && options.offlineOperation) {
            // Queue for offline sync
            queueOfflineOperation({
              ...options.offlineOperation,
              maxRetries: 3,
            });
            
            logger.info('Operation queued for offline sync', {
              operation: options.offlineOperation.operation,
              table: options.offlineOperation.table,
            });
            
            // Return a placeholder result for offline mode
            return {} as TData;
          }

          return mutationFn(variables);
        },
        onMutate: options.onMutate,
        onError: (error, variables, context) => {
          logger.error('Optimistic mutation failed', error, { variables });
          options.onError?.(error, variables, context);
        },
        onSuccess: (data, variables, context) => {
          logger.debug('Optimistic mutation succeeded', { variables });
          options.onSuccess?.(data, variables, context);
        },
        onSettled: () => {
          // Invalidate related queries to ensure fresh data
          if (options.queryKey) {
            queryClient.invalidateQueries({ queryKey: options.queryKey });
          }
          options.onSettled?.();
        },
      });
    },
    [isOnline, queueOfflineOperation, queryClient]
  );

  return {
    optimisticUpdate,
    optimisticMutation,
    isOnline,
  };
};

// Enhanced data fetching with cache integration
export const useCachedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    fallbackData?: T;
    offlineFirst?: boolean;
  } = {}
) => {
  const cache = useCache();
  const cacheKey = queryKey.join(':');

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Try cache first if offline or offlineFirst is enabled
      if ((!cache.isOnline || options.offlineFirst) && !options.enabled) {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          logger.debug('Serving data from cache (offline mode)', { queryKey });
          return cachedData;
        }
      }

      try {
        const data = await queryFn();
        
        // Cache the successful result
        cache.set(cacheKey, data, options.cacheTime || 300000); // 5 minutes default
        
        logger.debug('Data fetched and cached', { queryKey, cacheKey });
        return data;
      } catch (error) {
        // Fallback to cache if network request fails
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          logger.warn('Network request failed, serving from cache', { error, queryKey });
          return cachedData;
        }
        
        // If we have fallback data, use it
        if (options.fallbackData) {
          logger.warn('Using fallback data due to network error', { error, queryKey });
          return options.fallbackData;
        }
        
        throw error;
      }
    },
    staleTime: options.staleTime || 0,
    enabled: options.enabled !== false,
    retry: (failureCount, error) => {
      // Don't retry if we're offline
      if (!cache.isOnline) return false;
      
      // Retry up to 3 times with exponential backoff
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Permission caching hook
export const usePermissionCache = () => {
  const cache = useCache();
  const PERMISSION_CACHE_TTL = 600000; // 10 minutes

  const getUserPermissions = React.useCallback(
    async (userId: string): Promise<Record<string, boolean>> => {
      const cacheKey = `permissions:${userId}`;
      
      // Try cache first
      const cachedPermissions = cache.get<Record<string, boolean>>(cacheKey);
      if (cachedPermissions) {
        logger.debug('Permissions served from cache', { userId });
        return cachedPermissions;
      }

      try {
        // Fetch from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('custom_permissions, role, secondary_roles')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        // Compute effective permissions
        const permissions = computeEffectivePermissions(profile);
        
        // Cache the result
        cache.set(cacheKey, permissions, PERMISSION_CACHE_TTL);
        
        logger.debug('Permissions fetched and cached', { userId, permissions });
        return permissions;
      } catch (error) {
        logger.error('Failed to fetch user permissions', error, { userId });
        return {};
      }
    },
    [cache]
  );

  const invalidateUserPermissions = React.useCallback(
    (userId: string) => {
      const cacheKey = `permissions:${userId}`;
      cache.remove(cacheKey);
      logger.debug('User permissions cache invalidated', { userId });
    },
    [cache]
  );

  const invalidateAllPermissions = React.useCallback(() => {
    cache.invalidatePattern('^permissions:');
    logger.debug('All permissions cache invalidated');
  }, [cache]);

  return {
    getUserPermissions,
    invalidateUserPermissions,
    invalidateAllPermissions,
  };
};

// Utility function to compute effective permissions
const computeEffectivePermissions = (profile: any): Record<string, boolean> => {
  if (!profile) return {};

  const basePermissions = getBasePermissionsForRole(profile.role);
  const secondaryPermissions = profile.secondary_roles?.reduce(
    (acc: Record<string, boolean>, role: string) => ({
      ...acc,
      ...getBasePermissionsForRole(role),
    }),
    {}
  ) || {};
  
  const customPermissions = profile.custom_permissions || {};

  // Merge permissions (custom permissions override others)
  return {
    ...basePermissions,
    ...secondaryPermissions,
    ...customPermissions,
  };
};

// Base permissions for each role
const getBasePermissionsForRole = (role: string): Record<string, boolean> => {
  const rolePermissions: Record<string, Record<string, boolean>> = {
    super_admin: {
      'admin.users.create': true,
      'admin.users.read': true,
      'admin.users.update': true,
      'admin.users.delete': true,
      'admin.system.read': true,
      'admin.system.update': true,
      'properties.create': true,
      'properties.read': true,
      'properties.update': true,
      'properties.delete': true,
      'tasks.create': true,
      'tasks.read': true,
      'tasks.update': true,
      'tasks.delete': true,
      'inventory.create': true,
      'inventory.read': true,
      'inventory.update': true,
      'inventory.delete': true,
    },
    property_manager: {
      'properties.read': true,
      'properties.update': true,
      'tasks.create': true,
      'tasks.read': true,
      'tasks.update': true,
      'inventory.read': true,
      'inventory.update': true,
    },
    housekeeper: {
      'tasks.read': true,
      'tasks.update': true,
      'inventory.read': true,
    },
    maintenance: {
      'tasks.read': true,
      'tasks.update': true,
      'inventory.read': true,
      'inventory.update': true,
    },
  };

  return rolePermissions[role] || {};
};