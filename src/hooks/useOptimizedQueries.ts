import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { DatabaseConnectionPool, executeOptimizedQuery } from '@/utils/databasePooling';
import { ServerCache } from '@/utils/cdnOptimization';

// Optimized profiles query with caching and connection pooling
export const useOptimizedProfiles = (filters?: {
  role?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async () => {
      const cacheKey = `profiles_${JSON.stringify(filters)}`;
      
      // Check server cache first
      const cachedData = ServerCache.get(cacheKey);
      if (cachedData) return cachedData;

      const pool = DatabaseConnectionPool.getInstance();
      const connection = await pool.getConnection();
      
      let query = connection
        .from('profiles')
        .select('id, name, email, role, avatar, created_at')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Cache the result
      ServerCache.set(cacheKey, data, 5 * 60 * 1000);
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized properties query with selective fields
export const useOptimizedProperties = (includeDetails = false) => {
  const selectFields = includeDetails 
    ? '*'
    : 'id, name, address, status, image_url, price_per_night, max_guests';

  return useQuery({
    queryKey: ['properties', includeDetails],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(selectFields)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Infinite scroll for large datasets
export const useInfiniteBookings = (listingId?: string, pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: ['bookings', 'infinite', listingId],
    queryFn: async ({ pageParam = 0 }) => {
      // Using type assertion for guesty_bookings table not in generated types
      let query = (supabase as any)
        .from('guesty_bookings')
        .select(`
          id,
          check_in,
          check_out,
          status,
          guest_name,
          guest_email,
          listing_id
        `)
        .order('check_in', { ascending: false })
        .range(pageParam as number, (pageParam as number) + pageSize - 1);

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: data || [],
        nextPage: (data?.length || 0) === pageSize ? (pageParam as number) + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Optimized task queries with aggregation
export const useOptimizedTasks = (filters?: {
  status?: string;
  assignee?: string;
  dueDate?: string;
}) => {
  return useQuery({
    queryKey: ['tasks', 'optimized', filters],
    queryFn: async () => {
      // Get detailed tasks with selective fields
      let query = supabase
        .from('housekeeping_tasks')
        .select(`
          id,
          task_type,
          status,
          due_date,
          listing_id,
          assigned_to
        `)
        .order('due_date');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.assignee) {
        query = query.eq('assigned_to', filters.assignee);
      }

      if (filters?.dueDate) {
        query = query.gte('due_date', filters.dueDate);
      }

      const { data: tasks, error: tasksError } = await query.limit(50);
      if (tasksError) throw tasksError;

      // Calculate summary
      const summary = {
        total: tasks?.length || 0,
        pending: tasks?.filter(t => t.status === 'pending').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        overdue: tasks?.filter(t => 
          t.status !== 'completed' && 
          new Date(t.due_date) < new Date()
        ).length || 0
      };

      return { summary, tasks: tasks || [] };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Background prefetching hook
export const useBackgroundPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchProperties = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['properties', false],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, address, status, image_url')
          .eq('status', 'active');
        
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchRecentActivity = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['activity', 'recent'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('table_name, action, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data;
      },
      staleTime: 1 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchProperties,
    prefetchRecentActivity,
  };
};

// Smart cache invalidation
export const useSmartInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = useCallback((tableName: string, operation: string) => {
    const invalidationMap: Record<string, string[][]> = {
      profiles: [
        ['profiles'],
        ['users-list'],
      ],
      properties: [
        ['properties'],
        ['dashboard-metrics'],
      ],
      housekeeping_tasks: [
        ['tasks'],
        ['dashboard-metrics'],
        ['recent-activity'],
      ],
      guesty_bookings: [
        ['bookings'],
        ['dashboard-metrics'],
        ['financial-reports'],
      ],
    };

    const queriesToInvalidate = invalidationMap[tableName] || [];
    
    queriesToInvalidate.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient]);

  return { invalidateRelatedQueries };
};