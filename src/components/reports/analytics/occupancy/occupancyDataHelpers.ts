
// Helper functions for processing occupancy data

/**
 * Gets occupancy overview data for charts
 */
export const getOccupancyOverviewData = (occupancyData: any[] = [], selectedProperty: string = 'all') => {
  // If there's no data, return empty array
  if (!occupancyData || occupancyData.length === 0) {
    return [];
  }
  
  // Filter data if a specific property is selected
  const filteredData = selectedProperty === 'all'
    ? occupancyData
    : occupancyData.filter(item => item.property === selectedProperty);
  
  // Group by month
  const groupedByMonth = filteredData.reduce((acc: any, curr: any) => {
    if (!acc[curr.month]) {
      acc[curr.month] = {
        month: curr.month,
        occupancy: 0,
        bookings: 0,
        revenue: 0,
        count: 0
      };
    }
    
    acc[curr.month].occupancy += curr.occupancy_rate;
    acc[curr.month].bookings += curr.bookings;
    acc[curr.month].revenue += curr.revenue;
    acc[curr.month].count += 1;
    
    return acc;
  }, {});
  
  // Calculate averages for occupancy rate
  Object.values(groupedByMonth).forEach((month: any) => {
    month.occupancy = Math.round(month.occupancy / month.count);
  });
  
  // Convert to array and sort by month
  return Object.values(groupedByMonth).sort((a: any, b: any) => {
    const [aYear, aMonth] = a.month.split('-').map(Number);
    const [bYear, bMonth] = b.month.split('-').map(Number);
    
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
};

/**
 * Gets bookings chart data
 */
export const getBookingsChartData = (occupancyData: any[] = [], selectedProperty: string = 'all') => {
  // If there's no data, return empty array
  if (!occupancyData || occupancyData.length === 0) {
    return [];
  }
  
  // Filter data if a specific property is selected
  const filteredData = selectedProperty === 'all'
    ? occupancyData
    : occupancyData.filter(item => item.property === selectedProperty);
  
  // Group by month
  const groupedByMonth = filteredData.reduce((acc: any, curr: any) => {
    if (!acc[curr.month]) {
      acc[curr.month] = {
        month: curr.month,
        bookings: 0,
        revenue: 0
      };
    }
    
    acc[curr.month].bookings += curr.bookings;
    acc[curr.month].revenue += curr.revenue;
    
    return acc;
  }, {});
  
  // Convert to array and sort by month
  return Object.values(groupedByMonth).sort((a: any, b: any) => {
    const [aYear, aMonth] = a.month.split('-').map(Number);
    const [bYear, bMonth] = b.month.split('-').map(Number);
    
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
};
