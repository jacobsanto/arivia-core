
import { format } from "date-fns";
import { toastService } from "@/services/toast";
import { analyticsService } from "@/services/analytics/analytics.service";
import { fetchPropertiesData } from "./propertyUtils";
import { fetchHousekeepingTasks } from "./housekeepingUtils";
import { fetchMaintenanceTasks } from "./maintenanceUtils";
import { fetchTodayRevenue } from "./revenueUtils";
import { DashboardData, TaskRecord } from "../types";

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
    
    // Fetch average rating
    let avgRating = 0;
    try {
      // In a real app, this would come from a reviews table or similar
      // For now, we'll use a placeholder value
      avgRating = 4.8;
    } catch (err) {
      console.log('No ratings data available:', err);
    }
    
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
        avgRating,
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
