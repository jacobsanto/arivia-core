import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { toastService } from "@/services/toast";
import { supabase } from "@/integrations/supabase/client";
import { refreshDashboardData } from "@/utils/dashboard";

export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance?: number;
    available?: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress?: number;
  };
  maintenance: {
    total: number;
    critical: number;
    standard: number;
  };
  upcomingTasks?: Array<any>;
  housekeepingTasks?: Array<any>;
  maintenanceTasks?: Array<any>;
  quickStats?: {
    occupancyRate: number;
    avgRating: number;
    revenueToday: number;
    pendingCheckouts: number;
  };
}

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 7))
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the date range in the format needed for queries
      const fromDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
      
      // --- PROPERTIES DATA ---
      let propertiesQuery = supabase.from('properties').select('id, status');
      
      // Apply property filter if not 'all'
      if (selectedProperty !== 'all') {
        propertiesQuery = propertiesQuery.eq('id', selectedProperty);
      }
      
      const { data: propertiesData, error: propertiesError } = await propertiesQuery;
      
      if (propertiesError) throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
      
      // Count properties by status
      const totalProperties = propertiesData?.length || 0;
      const occupiedProperties = propertiesData?.filter(p => p.status === 'occupied').length || 0;
      const vacantProperties = propertiesData?.filter(p => p.status === 'vacant').length || 0;
      const maintenanceProperties = propertiesData?.filter(p => p.status === 'maintenance').length || 0;
      
      // --- HOUSEKEEPING TASKS DATA ---
      let tasksQuery = supabase.from('housekeeping_tasks').select('id, status, due_date');
      
      // Apply property filter if not 'all'
      if (selectedProperty !== 'all') {
        tasksQuery = tasksQuery.eq('property_id', selectedProperty);
      }
      
      // Apply date range filter if available
      if (fromDateStr && toDateStr) {
        tasksQuery = tasksQuery.gte('due_date', fromDateStr).lte('due_date', toDateStr);
      }
      
      const { data: tasksData, error: tasksError } = await tasksQuery;
      
      if (tasksError) throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      
      // Count tasks by status
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
      const pendingTasks = tasksData?.filter(t => t.status === 'pending').length || 0;
      const inProgressTasks = tasksData?.filter(t => t.status === 'in_progress').length || 0;
      
      // --- MAINTENANCE TASKS DATA ---
      let maintenanceQuery = supabase.from('maintenance_tasks').select('id, status, priority, due_date');
      
      // Apply property filter if not 'all'
      if (selectedProperty !== 'all') {
        maintenanceQuery = maintenanceQuery.eq('property_id', selectedProperty);
      }
      
      // Apply date range filter if available
      if (fromDateStr && toDateStr) {
        maintenanceQuery = maintenanceQuery.gte('due_date', fromDateStr).lte('due_date', toDateStr);
      }
      
      const { data: maintenanceData, error: maintenanceError } = await maintenanceQuery;
      
      if (maintenanceError) throw new Error(`Failed to fetch maintenance tasks: ${maintenanceError.message}`);
      
      // Count maintenance tasks by priority
      const totalMaintenance = maintenanceData?.length || 0;
      const criticalMaintenance = maintenanceData?.filter(m => m.priority === 'high' || m.priority === 'urgent').length || 0;
      const standardMaintenance = maintenanceData?.filter(m => m.priority === 'normal' || m.priority === 'low').length || 0;
      
      // --- UPCOMING TASKS ---
      // Get the 5 most imminent tasks
      const now = new Date();
      const upcomingTasks = [...(tasksData || []), ...(maintenanceData || [])]
        .filter(task => new Date(task.due_date) >= now && task.status !== 'completed')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);
      
      // --- CALCULATE QUICK STATS ---
      // Calculate occupancy rate
      const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
      
      // Calculate revenue for today (this would ideally be from a financial table)
      let revenueToday = 0;
      try {
        // Example: query a financial_reports table for today's revenue
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: financialData } = await supabase
          .from('financial_reports')
          .select('revenue')
          .eq('date', today)
          .single();
        
        revenueToday = financialData?.revenue || 0;
      } catch (finError) {
        console.log('No financial data available for today:', finError);
        // Fallback to a calculated value if no financial data exists
        revenueToday = occupiedProperties * 250; // Example rate
      }
      
      // Assemble the dashboard data object with all the fetched information
      const newDashboardData: DashboardData = {
        properties: {
          total: totalProperties,
          occupied: occupiedProperties,
          vacant: vacantProperties,
          maintenance: maintenanceProperties,
          available: vacantProperties - maintenanceProperties
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks
        },
        maintenance: {
          total: totalMaintenance,
          critical: criticalMaintenance,
          standard: standardMaintenance
        },
        upcomingTasks: upcomingTasks,
        housekeepingTasks: tasksData || [],
        maintenanceTasks: maintenanceData || [],
        quickStats: {
          occupancyRate: occupancyRate,
          avgRating: 4.8, // This would ideally come from a reviews table
          revenueToday: revenueToday,
          pendingCheckouts: pendingTasks // Or a more specific metric if available
        }
      };
      
      setDashboardData(newDashboardData);
      setLastRefreshed(new Date());
      setIsLoading(false);
      
      return newDashboardData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toastService.error("Dashboard data error", {
        description: errorMessage
      });
      setIsLoading(false);
      throw err;
    }
  }, [selectedProperty, dateRange]);

  useEffect(() => {
    let isMounted = true;
    
    // Only update state if component is still mounted
    loadDashboardData().catch(err => {
      // Handle error but prevent state updates if unmounted
      if (!isMounted) return;
      // Error already handled in loadDashboardData
    });
    
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const handlePropertyChange = useCallback((property: string) => {
    setSelectedProperty(property);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const refreshDashboard = useCallback(() => {
    return refreshDashboardData(loadDashboardData);
  }, [loadDashboardData]);

  return {
    selectedProperty,
    dateRange,
    dashboardData,
    lastRefreshed,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error
  };
};
