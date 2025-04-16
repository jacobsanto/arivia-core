
import { financialData, revenueByPropertyData, expenseAnalysisData } from "@/components/reports/analytics/financialData";
import { occupancyData, monthlyOccupancyData } from "@/components/reports/analytics/occupancyData";

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

