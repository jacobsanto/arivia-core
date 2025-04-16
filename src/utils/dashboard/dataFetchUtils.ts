
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DashboardData } from "@/hooks/useDashboard";
import { toastService } from "@/services/toast";

/**
 * Fetches properties data from Supabase
 */
export const fetchPropertiesData = async (selectedProperty: string) => {
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
  
  return {
    propertiesData,
    stats: {
      total: totalProperties,
      occupied: occupiedProperties,
      vacant: vacantProperties,
      maintenance: maintenanceProperties,
      available: vacantProperties - maintenanceProperties
    }
  };
};

/**
 * Fetches housekeeping tasks data from Supabase
 */
export const fetchHousekeepingTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
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
  
  return {
    tasksData,
    stats: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks
    }
  };
};

/**
 * Fetches maintenance tasks data from Supabase
 */
export const fetchMaintenanceTasks = async (selectedProperty: string, fromDateStr: string | null, toDateStr: string | null) => {
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
  
  return {
    maintenanceData,
    stats: {
      total: totalMaintenance,
      critical: criticalMaintenance,
      standard: standardMaintenance
    }
  };
};

/**
 * Calculates revenue for today
 */
export const fetchTodayRevenue = async () => {
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
  }
  
  return revenueToday;
};

// Define a simple type for task records to avoid infinite type instantiation
type TaskRecord = {
  id: string;
  status: string;
  due_date: string;
  priority?: string;
  [key: string]: any;
};

/**
 * Fetch and assemble complete dashboard data
 */
export const fetchDashboardData = async (
  selectedProperty: string,
  dateRange: { from: Date; to: Date }
): Promise<DashboardData> => {
  try {
    // Get the date range in the format needed for queries
    const fromDateStr = format(dateRange.from, 'yyyy-MM-dd');
    const toDateStr = format(dateRange.to, 'yyyy-MM-dd');
    
    // Fetch all required data in parallel
    const [propertiesResult, tasksResult, maintenanceResult] = await Promise.all([
      fetchPropertiesData(selectedProperty),
      fetchHousekeepingTasks(selectedProperty, fromDateStr, toDateStr),
      fetchMaintenanceTasks(selectedProperty, fromDateStr, toDateStr)
    ]);
    
    // Get upcoming tasks (combine both task types)
    const now = new Date();
    const upcomingTasks = [
      ...(tasksResult.tasksData || []), 
      ...(maintenanceResult.maintenanceData || [])
    ]
      .filter(task => new Date(task.due_date) >= now && task.status !== 'completed')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5) as TaskRecord[];
    
    // Calculate occupancy rate
    const occupancyRate = propertiesResult.stats.total > 0 
      ? Math.round((propertiesResult.stats.occupied / propertiesResult.stats.total) * 100) 
      : 0;
    
    // Calculate revenue for today
    const revenueToday = await fetchTodayRevenue();
    
    // Assemble the dashboard data object
    return {
      properties: propertiesResult.stats,
      tasks: tasksResult.stats,
      maintenance: maintenanceResult.stats,
      upcomingTasks,
      housekeepingTasks: tasksResult.tasksData || [],
      maintenanceTasks: maintenanceResult.maintenanceData || [],
      quickStats: {
        occupancyRate,
        avgRating: 4.8, // This would ideally come from a reviews table
        revenueToday,
        pendingCheckouts: tasksResult.stats.pending // Or a more specific metric if available
      }
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
    toastService.error("Dashboard data error", {
      description: errorMessage
    });
    throw err;
  }
};
