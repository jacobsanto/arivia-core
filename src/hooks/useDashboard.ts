import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DashboardMetrics {
  totalProperties: number;
  activeTasks: number;
  todayBookings: number;
  monthlyRevenue: number;
  urgentTasks: number;
  completedTasks: number;
}

export const useDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProperties: 0,
    activeTasks: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    urgentTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard metrics with error handling for each query
      const [propertiesResult, tasksResult, bookingsResult] = await Promise.allSettled([
        supabase.from('guesty_listings').select('*', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('housekeeping_tasks').select('*', { count: 'exact' }).neq('status', 'completed'),
        supabase.from('guesty_bookings').select('*', { count: 'exact' }).eq('status', 'confirmed')
      ]);

      const dashboardData: DashboardMetrics = {
        totalProperties: propertiesResult.status === 'fulfilled' ? (propertiesResult.value.count || 0) : 0,
        activeTasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.count || 0) : 0,
        todayBookings: bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0,
        monthlyRevenue: 0, // Placeholder - would need revenue calculation
        urgentTasks: 0,    // Placeholder - would need priority filtering
        completedTasks: 0, // Placeholder - would need completed task count
      };

      setMetrics(dashboardData);

      // Log any failed queries
      if (propertiesResult.status === 'rejected') {
        console.error('Failed to fetch properties:', propertiesResult.reason);
      }
      if (tasksResult.status === 'rejected') {
        console.error('Failed to fetch tasks:', tasksResult.reason);
      }
      if (bookingsResult.status === 'rejected') {
        console.error('Failed to fetch bookings:', bookingsResult.reason);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard metrics';
      setError(errorMessage);
      console.error('Dashboard metrics error:', err);
      
      toast({
        title: "Error Loading Dashboard",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Provide fallback data
      setMetrics({
        totalProperties: 0,
        activeTasks: 0,
        todayBookings: 0,
        monthlyRevenue: 0,
        urgentTasks: 0,
        completedTasks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const refetch = () => {
    fetchDashboardMetrics();
  };

  return {
    metrics,
    loading,
    error,
    refetch,
  };
};