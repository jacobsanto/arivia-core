import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { deduplicateRequest } from '@/utils/authOptimizer';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';

export interface DashboardMetrics {
  totalProperties: number;
  activeTasks: number;
  todayBookings: number;
  monthlyRevenue: number;
  urgentTasks: number;
  completedTasks: number;
}

// Cache dashboard metrics to reduce repeated queries
const metricsCache = {
  data: null as DashboardMetrics | null,
  timestamp: 0,
  duration: 2 * 60 * 1000 // 2 minutes cache
};

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
  const { logRequest } = useEgressMonitor();

  const fetchDashboardMetrics = useCallback(async () => {
    return deduplicateRequest('dashboard-metrics', async () => {
      // Check cache first
      if (metricsCache.data && Date.now() - metricsCache.timestamp < metricsCache.duration) {
        setMetrics(metricsCache.data);
        setLoading(false);
        return metricsCache.data;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use a single optimized function call instead of multiple queries
        const { data: dashboardData, error: dashboardError } = await supabase
          .rpc('get_dashboard_metrics');

        if (dashboardError) {
          throw dashboardError;
        }

        // Type guard for dashboard data
        const parsedData = typeof dashboardData === 'object' && dashboardData ? dashboardData as any : {};

        const processedMetrics: DashboardMetrics = {
          totalProperties: parsedData?.properties?.total || 0,
          activeTasks: parsedData?.tasks_today || 0,
          todayBookings: parsedData?.bookings_this_month || 0,
          monthlyRevenue: parsedData?.revenue_this_month || 0,
          urgentTasks: 0,
          completedTasks: 0,
        };

        // Cache the results
        metricsCache.data = processedMetrics;
        metricsCache.timestamp = Date.now();
        
        setMetrics(processedMetrics);
        
        // Log the successful request
        logRequest(JSON.stringify(dashboardData).length);
        
        return processedMetrics;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard metrics';
        setError(errorMessage);
        console.error('Dashboard metrics error:', err);
        
        // Log the failed request
        logRequest(100, true);
        
        toast({
          title: "Error Loading Dashboard",
          description: "Using cached data if available",
          variant: "destructive",
        });
        
        // Use cached data as fallback if available
        if (metricsCache.data) {
          setMetrics(metricsCache.data);
        } else {
          setMetrics({
            totalProperties: 0,
            activeTasks: 0,
            todayBookings: 0,
            monthlyRevenue: 0,
            urgentTasks: 0,
            completedTasks: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    });
  }, [logRequest]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  const refetch = useCallback(() => {
    // Clear cache on manual refetch
    metricsCache.timestamp = 0;
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch,
  };
};