import { useState, useCallback, useEffect } from 'react';
import { 
  AnalyticsData, 
  AnalyticsFilters, 
  KPIMetrics,
  FinancialOverviewData,
  PropertyInsight,
  TaskPriorityData,
  TaskTypeBreakdown,
  TeamPerformanceData,
  PRIORITY_COLORS,
  TASK_TYPE_COLORS
} from '@/types/analytics.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, subDays, subMonths, startOfYear, endOfDay, startOfDay } from 'date-fns';

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'last-30-days'
  });

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'last-7-days':
        return { start: subDays(now, 7), end: now };
      case 'last-30-days':
        return { start: subDays(now, 30), end: now };
      case 'last-90-days':
        return { start: subDays(now, 90), end: now };
      case 'this-year':
        return { start: startOfYear(now), end: now };
      case 'custom':
        return {
          start: filters.startDate ? new Date(filters.startDate) : subDays(now, 30),
          end: filters.endDate ? new Date(filters.endDate) : now
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  }, [filters]);

  const fetchKPIMetrics = useCallback(async (startDate: Date, endDate: Date, propertyId?: string) => {
    const startIso = startOfDay(startDate).toISOString();
    const endIso = endOfDay(endDate).toISOString();

    try {
      // Fetch housekeeping tasks
      let housekeepingQuery = supabase
        .from('housekeeping_tasks')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        housekeepingQuery = housekeepingQuery.eq('property_id', propertyId);
      }

      const { data: housekeepingTasks } = await housekeepingQuery;

      // Fetch maintenance tasks
      let maintenanceQuery = supabase
        .from('maintenance_tasks')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        maintenanceQuery = maintenanceQuery.eq('property_id', propertyId);
      }

      const { data: maintenanceTasks } = await maintenanceQuery;

      // Fetch damage reports
      let damageQuery = supabase
        .from('damage_reports')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        damageQuery = damageQuery.eq('property_id', propertyId);
      }

      const { data: damageReports } = await damageQuery;

      // Calculate metrics
      const completedHousekeeping = housekeepingTasks?.filter(task => task.status === 'completed') || [];
      const completedMaintenance = maintenanceTasks?.filter(task => task.status === 'completed') || [];
      const totalCompleted = completedHousekeeping.length + completedMaintenance.length;

      const openHousekeeping = housekeepingTasks?.filter(task => task.status !== 'completed') || [];
      const openMaintenance = maintenanceTasks?.filter(task => task.status !== 'completed') || [];
      const openDamageReports = damageReports?.filter(report => !report.resolved_at) || [];
      const totalOpen = openHousekeeping.length + openMaintenance.length + openDamageReports.length;

      // Calculate costs (mock calculation - in real implementation would have actual cost data)
      const maintenanceCosts = completedMaintenance.reduce((sum, task) => sum + (Math.random() * 200 + 50), 0);
      const damageCosts = damageReports?.reduce((sum, report) => sum + (Math.random() * 500 + 100), 0) || 0;
      const totalCosts = maintenanceCosts + damageCosts;

      const avgCostPerTask = totalCompleted > 0 ? totalCosts / totalCompleted : 0;

      return {
        totalOperationalCosts: totalCosts,
        tasksCompleted: totalCompleted,
        openIssues: totalOpen,
        avgCostPerTask: avgCostPerTask
      };
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      throw error;
    }
  }, []);

  const fetchFinancialOverview = useCallback(async (startDate: Date, endDate: Date, propertyId?: string) => {
    // Generate monthly data for the date range
    const months = [];
    const current = new Date(startDate);
    current.setDate(1); // Start of month

    while (current <= endDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    // Mock financial data - in real implementation would calculate from actual data
    const financialData: FinancialOverviewData[] = months.map(month => {
      const monthStr = format(month, 'MMM yyyy');
      const maintenanceCosts = Math.random() * 2000 + 1000;
      const damageCosts = Math.random() * 1500 + 500;
      
      return {
        month: monthStr,
        maintenanceCosts,
        damageCosts,
        totalCosts: maintenanceCosts + damageCosts
      };
    });

    return financialData;
  }, []);

  const fetchPropertyInsights = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      // Fetch properties
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name');

      if (!properties) return [];

      // Mock property insights - in real implementation would calculate from actual cost data
      const insights: PropertyInsight[] = properties.map(property => ({
        propertyName: property.name,
        totalCosts: Math.random() * 5000 + 1000,
        taskCount: Math.floor(Math.random() * 50) + 10
      }));

      return insights.sort((a, b) => b.totalCosts - a.totalCosts);
    } catch (error) {
      console.error('Error fetching property insights:', error);
      return [];
    }
  }, []);

  const fetchTaskPriorities = useCallback(async (startDate: Date, endDate: Date, propertyId?: string) => {
    const startIso = startOfDay(startDate).toISOString();
    const endIso = endOfDay(endDate).toISOString();

    try {
      // Fetch open housekeeping tasks
      let housekeepingQuery = supabase
        .from('housekeeping_tasks')
        .select('priority')
        .neq('status', 'completed')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        housekeepingQuery = housekeepingQuery.eq('property_id', propertyId);
      }

      // Fetch open maintenance tasks
      let maintenanceQuery = supabase
        .from('maintenance_tasks')
        .select('priority')
        .neq('status', 'completed')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        maintenanceQuery = maintenanceQuery.eq('property_id', propertyId);
      }

      const [{ data: housekeepingTasks }, { data: maintenanceTasks }] = await Promise.all([
        housekeepingQuery,
        maintenanceQuery
      ]);

      // Count priorities
      const priorityCounts: Record<string, number> = {};
      const allTasks = [...(housekeepingTasks || []), ...(maintenanceTasks || [])];
      
      allTasks.forEach(task => {
        const priority = task.priority || 'medium';
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });

      const taskPriorities: TaskPriorityData[] = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        count,
        color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium
      }));

      return taskPriorities;
    } catch (error) {
      console.error('Error fetching task priorities:', error);
      return [];
    }
  }, []);

  const fetchTaskTypeBreakdown = useCallback(async (startDate: Date, endDate: Date, propertyId?: string) => {
    const startIso = startOfDay(startDate).toISOString();
    const endIso = endOfDay(endDate).toISOString();

    try {
      // Fetch housekeeping tasks count
      let housekeepingQuery = supabase
        .from('housekeeping_tasks')
        .select('id', { count: 'exact' })
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        housekeepingQuery = housekeepingQuery.eq('property_id', propertyId);
      }

      // Fetch maintenance tasks count
      let maintenanceQuery = supabase
        .from('maintenance_tasks')
        .select('id', { count: 'exact' })
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (propertyId) {
        maintenanceQuery = maintenanceQuery.eq('property_id', propertyId);
      }

      const [{ count: housekeepingCount }, { count: maintenanceCount }] = await Promise.all([
        housekeepingQuery,
        maintenanceQuery
      ]);

      const totalTasks = (housekeepingCount || 0) + (maintenanceCount || 0);
      
      if (totalTasks === 0) {
        return [];
      }

      const breakdown: TaskTypeBreakdown[] = [
        {
          type: 'Housekeeping',
          count: housekeepingCount || 0,
          percentage: ((housekeepingCount || 0) / totalTasks) * 100,
          color: TASK_TYPE_COLORS.housekeeping
        },
        {
          type: 'Maintenance',
          count: maintenanceCount || 0,
          percentage: ((maintenanceCount || 0) / totalTasks) * 100,
          color: TASK_TYPE_COLORS.maintenance
        }
      ];

      return breakdown.filter(item => item.count > 0);
    } catch (error) {
      console.error('Error fetching task type breakdown:', error);
      return [];
    }
  }, []);

  const fetchTeamPerformance = useCallback(async (startDate: Date, endDate: Date, propertyId?: string) => {
    const startIso = startOfDay(startDate).toISOString();
    const endIso = endOfDay(endDate).toISOString();

    try {
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, name, role, avatar');

      if (!profiles) return [];

      // For each profile, fetch their task completion data
      const teamPerformance: TeamPerformanceData[] = await Promise.all(
        profiles.map(async (profile) => {
          // Fetch housekeeping tasks
          let housekeepingQuery = supabase
            .from('housekeeping_tasks')
            .select('id', { count: 'exact' })
            .eq('assigned_to', profile.user_id)
            .eq('status', 'completed')
            .gte('completed_at', startIso)
            .lte('completed_at', endIso);

          if (propertyId) {
            housekeepingQuery = housekeepingQuery.eq('property_id', propertyId);
          }

          // Fetch maintenance tasks
          let maintenanceQuery = supabase
            .from('maintenance_tasks')
            .select('id', { count: 'exact' })
            .eq('assigned_to', profile.user_id)
            .eq('status', 'completed')
            .gte('completed_at', startIso)
            .lte('completed_at', endIso);

          if (propertyId) {
            maintenanceQuery = maintenanceQuery.eq('property_id', propertyId);
          }

          const [{ count: housekeepingCount }, { count: maintenanceCount }] = await Promise.all([
            housekeepingQuery,
            maintenanceQuery
          ]);

          // Mock maintenance costs calculation
          const totalMaintenanceCosts = (maintenanceCount || 0) * (Math.random() * 150 + 50);

          return {
            id: profile.id,
            name: profile.name,
            role: profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            avatar: profile.avatar,
            completedTasks: (housekeepingCount || 0) + (maintenanceCount || 0),
            housekeepingTasks: housekeepingCount || 0,
            maintenanceTasks: maintenanceCount || 0,
            totalMaintenanceCosts
          };
        })
      );

      // Filter out team members with no completed tasks
      return teamPerformance
        .filter(member => member.completedTasks > 0)
        .sort((a, b) => b.completedTasks - a.completedTasks);
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return [];
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange();

      const [
        kpis,
        financialOverview,
        propertyInsights,
        taskPriorities,
        taskTypeBreakdown,
        teamPerformance
      ] = await Promise.all([
        fetchKPIMetrics(start, end, filters.propertyId),
        fetchFinancialOverview(start, end, filters.propertyId),
        fetchPropertyInsights(start, end),
        fetchTaskPriorities(start, end, filters.propertyId),
        fetchTaskTypeBreakdown(start, end, filters.propertyId),
        fetchTeamPerformance(start, end, filters.propertyId)
      ]);

      setData({
        kpis,
        financialOverview,
        propertyInsights,
        taskPriorities,
        taskTypeBreakdown,
        teamPerformance
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      toast({
        title: "Error Loading Analytics",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, getDateRange, fetchKPIMetrics, fetchFinancialOverview, fetchPropertyInsights, fetchTaskPriorities, fetchTaskTypeBreakdown, fetchTeamPerformance]);

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const getProperties = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refetchData: fetchAnalyticsData,
    getProperties
  };
};
