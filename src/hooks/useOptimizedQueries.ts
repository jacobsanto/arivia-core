import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deduplicateRequest } from '@/utils/authOptimizer';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';

// Query key factory for consistent caching
export const createQueryKey = (entity: string, params?: Record<string, any>) => {
  const baseKey = [entity];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        baseKey.push(`${key}:${value}`);
      }
    });
  }
  return baseKey;
};

// Optimized queries with caching and deduplication
export const useOptimizedQueries = () => {
  const { logRequest } = useEgressMonitor();

  // Properties query with intelligent caching
  const useProperties = (searchTerm?: string, filterStatus?: string) => {
    return useQuery({
      queryKey: createQueryKey('properties', { searchTerm, filterStatus }),
      queryFn: async () => {
        return deduplicateRequest(`properties-${searchTerm}-${filterStatus}`, async () => {
          let query = supabase.from('properties').select('*');
          
          if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
          }
          if (filterStatus && filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
          }
          
          const { data, error } = await query.order('created_at', { ascending: false });
          
          if (error) {
            logRequest(100, true);
            throw error;
          }
          
          logRequest(JSON.stringify(data).length);
          return data || [];
        });
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
          return false;
        }
        return failureCount < 2;
      }
    });
  };

  // Inventory query with optimized pagination
  const useInventory = (searchTerm?: string, page: number = 1, limit: number = 20) => {
    return useQuery({
      queryKey: createQueryKey('inventory', { searchTerm, page, limit }),
      queryFn: async () => {
        return deduplicateRequest(`inventory-${searchTerm}-${page}-${limit}`, async () => {
          let query = supabase
            .from('inventory_items')
            .select('*', { count: 'exact' })
            .range((page - 1) * limit, page * limit - 1);
          
          if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
          }
          
          const { data, error, count } = await query.order('created_at', { ascending: false });
          
          if (error) {
            logRequest(100, true);
            throw error;
          }
          
          logRequest(JSON.stringify(data).length);
          return { data: data || [], count: count || 0 };
        });
      },
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 8 * 60 * 1000, // 8 minutes
      placeholderData: (previousData) => previousData, // Keep previous page data while loading new page
    });
  };

  // Users query with role-based filtering
  const useUsers = (searchTerm?: string, filterRole?: string) => {
    return useQuery({
      queryKey: createQueryKey('users', { searchTerm, filterRole }),
      queryFn: async () => {
        return deduplicateRequest(`users-${searchTerm}-${filterRole}`, async () => {
          let query = supabase.from('profiles').select('*');
          
          if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
          }
          if (filterRole && filterRole !== 'all') {
            query = query.eq('role', filterRole);
          }
          
          const { data, error } = await query.order('created_at', { ascending: false });
          
          if (error) {
            logRequest(100, true);
            throw error;
          }
          
          logRequest(JSON.stringify(data).length);
          return data || [];
        });
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - user data changes less frequently
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: (failureCount, error: any) => {
        // Don't retry RLS policy errors
        if (error?.code === '42501' || error?.message?.includes('policy')) {
          return false;
        }
        return failureCount < 2;
      }
    });
  };

  // System health query with reduced frequency
  const useSystemHealth = () => {
    return useQuery({
      queryKey: ['system-health'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_system_health');
        
        if (error) {
          logRequest(100, true);
          throw error;
        }
        
        logRequest(JSON.stringify(data).length);
        return data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes - system health changes slowly
      gcTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on mount if data exists
    });
  };

  return {
    useProperties,
    useInventory,
    useUsers,
    useSystemHealth,
  };
};