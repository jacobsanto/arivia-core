
import { financialData, revenueByPropertyData, expenseAnalysisData } from "@/components/reports/analytics/financialData";
import { occupancyData, monthlyOccupancyData } from "@/components/reports/analytics/occupancyData";
import { DashboardData } from "@/hooks/useDashboard";

export const getDashboardFinancialData = (selectedProperty: string = "all") => {
  // Filter financial data based on property selection
  const filteredFinancialData = selectedProperty === "all"
    ? financialData
    : financialData.filter(data => data.property === selectedProperty);

  // Calculate totals and averages
  const totalRevenue = filteredFinancialData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = filteredFinancialData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return {
    financialData: filteredFinancialData,
    revenueByPropertyData,
    expenseAnalysisData,
    totalRevenue,
    totalExpenses,
    totalProfit,
    profitMargin: `${averageMargin}%`
  };
};

export const getDashboardOccupancyData = (selectedProperty: string = "all") => {
  // Filter occupancy data based on property selection
  const filteredOccupancyData = selectedProperty === "all" 
    ? occupancyData
    : occupancyData.filter(data => data.property === selectedProperty);

  // Filter monthly occupancy data based on property selection
  const filteredMonthlyData = selectedProperty === "all"
    ? monthlyOccupancyData
    : monthlyOccupancyData.filter(data => data.property === selectedProperty);

  // Calculate averages
  const totalBookings = filteredOccupancyData.reduce((sum, item) => sum + item.bookings, 0);
  const avgOccupancyRate = filteredOccupancyData.length > 0
    ? Math.round(filteredOccupancyData.reduce((sum, item) => sum + item.occupancyRate, 0) / filteredOccupancyData.length)
    : 0;
  const avgStayDuration = filteredOccupancyData.length > 0 && filteredOccupancyData.some(item => item.averageStay)
    ? (filteredOccupancyData.reduce((sum, item) => sum + (item.averageStay || 0), 0) / filteredOccupancyData.length).toFixed(1)
    : "N/A";

  return {
    occupancyData: filteredOccupancyData,
    monthlyOccupancyData: filteredMonthlyData,
    totalBookings,
    avgOccupancyRate,
    avgStayDuration
  };
};

/**
 * Generate mock dashboard data as a fallback when database is empty
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
