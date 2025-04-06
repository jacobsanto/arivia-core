
// Sample data for occupancy reports
export const monthlyOccupancyData = [
  { month: "Jan", occupancyRate: 65, revenue: 18500, bookings: 42 },
  { month: "Feb", occupancyRate: 70, revenue: 19800, bookings: 45 },
  { month: "Mar", occupancyRate: 78, revenue: 22500, bookings: 51 },
  { month: "Apr", occupancyRate: 82, revenue: 24000, bookings: 55 },
  { month: "May", occupancyRate: 88, revenue: 26500, bookings: 62 },
  { month: "Jun", occupancyRate: 92, revenue: 28800, bookings: 68 },
  { month: "Jul", occupancyRate: 96, revenue: 31200, bookings: 73 },
  { month: "Aug", occupancyRate: 95, revenue: 30500, bookings: 72 },
  { month: "Sep", occupancyRate: 86, revenue: 25800, bookings: 60 },
  { month: "Oct", occupancyRate: 78, revenue: 22600, bookings: 52 },
  { month: "Nov", occupancyRate: 72, revenue: 20400, bookings: 46 },
  { month: "Dec", occupancyRate: 80, revenue: 24500, bookings: 58 },
];

export const averageStayData = [
  { property: "Villa Caldera", averageDays: 5.2, totalBookings: 120, revenue: 45600 },
  { property: "Villa Sunset", averageDays: 4.8, totalBookings: 145, revenue: 52300 },
  { property: "Villa Oceana", averageDays: 6.3, totalBookings: 98, revenue: 61200 },
  { property: "Villa Paradiso", averageDays: 7.1, totalBookings: 85, revenue: 72500 },
  { property: "Villa Azure", averageDays: 5.7, totalBookings: 112, revenue: 58400 },
];

export const seasonalTrendsData = [
  { season: "Winter", occupancyRate: 68, averageRate: 320, totalRevenue: 62400 },
  { season: "Spring", occupancyRate: 82, averageRate: 290, totalRevenue: 78300 },
  { season: "Summer", occupancyRate: 94, averageRate: 350, totalRevenue: 108500 },
  { season: "Fall", occupancyRate: 78, averageRate: 275, totalRevenue: 68200 },
];

// Format data for display in reports
export const formatOccupancyReportData = (data: any[], property: string = "all") => {
  if (property === "all") {
    return data;
  }
  
  // Filter data for specific property if needed
  // For now, just return the data since our sample doesn't have property-specific data
  return data;
};
