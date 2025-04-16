
// This file has been refactored and replaced by proper utilities in src/services/analytics and src/utils/dashboard
// Importing from new location for backward compatibility
import { DashboardData } from "@/hooks/useDashboard";
import { fetchDashboardData } from "@/utils/dashboard/dataFetchUtils";
import { analyticsService } from "@/services/analytics/analytics.service";

// Legacy function to maintain backward compatibility
export const getDashboardData = async (
  selectedProperty: string = "all", 
  dateRange: { from: Date; to: Date }
): Promise<DashboardData> => {
  return fetchDashboardData(selectedProperty, dateRange);
};

// Legacy functions providing financial data
export const getDashboardFinancialData = async (
  selectedProperty: string = "all",
  dateRange?: { from?: Date; to?: Date }
) => {
  const financialData = await analyticsService.getFinancialReports(dateRange);
  const filteredData = analyticsService.formatFinancialReportData(
    financialData, 
    selectedProperty
  );
  
  // Calculate totals and averages
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return {
    financialData: filteredData,
    totalRevenue,
    totalExpenses,
    totalProfit,
    profitMargin: `${averageMargin}%`
  };
};

// Legacy functions providing occupancy data
export const getDashboardOccupancyData = async (
  selectedProperty: string = "all",
  dateRange?: { from?: Date; to?: Date }
) => {
  const occupancyData = await analyticsService.getOccupancyReports(dateRange);
  const filteredData = analyticsService.formatOccupancyReportData(
    occupancyData, 
    selectedProperty
  );

  // Calculate averages
  const totalBookings = filteredData.reduce((sum, item) => sum + item.bookings, 0);
  const avgOccupancyRate = filteredData.length > 0
    ? Math.round(filteredData.reduce((sum, item) => sum + item.occupancy_rate, 0) / filteredData.length)
    : 0;
  const avgStayDuration = filteredData.length > 0 && filteredData.some(item => item.average_stay)
    ? (filteredData.reduce((sum, item) => sum + (item.average_stay || 0), 0) / filteredData.length).toFixed(1)
    : "N/A";

  return {
    occupancyData: filteredData,
    totalBookings,
    avgOccupancyRate,
    avgStayDuration
  };
};

/**
 * Generate default dashboard data as a fallback when database is empty
 * This is useful during development or when setting up a new instance
 */
export const getDefaultDashboardData = (): DashboardData => {
  return {
    properties: {
      total: 15,
      occupied: 9,
      vacant: 4,
      maintenance: 2,
      available: 4
    },
    tasks: {
      total: 24,
      completed: 12,
      pending: 4,
      inProgress: 8
    },
    maintenance: {
      total: 14,
      critical: 3,
      standard: 11
    },
    upcomingTasks: [],
    housekeepingTasks: [],
    maintenanceTasks: [],
    quickStats: {
      occupancyRate: 75,
      avgRating: 4.8,
      revenueToday: 2450,
      pendingCheckouts: 3
    }
  };
};
