
// Sample data for occupancy reports
export const monthlyOccupancyData = [
  { month: "Jan", occupancyRate: 65, revenue: 18500, bookings: 42, property: "Villa Caldera" },
  { month: "Feb", occupancyRate: 70, revenue: 19800, bookings: 45, property: "Villa Caldera" },
  { month: "Mar", occupancyRate: 78, revenue: 22500, bookings: 51, property: "Villa Sunset" },
  { month: "Apr", occupancyRate: 82, revenue: 24000, bookings: 55, property: "Villa Sunset" },
  { month: "May", occupancyRate: 88, revenue: 26500, bookings: 62, property: "Villa Oceana" },
  { month: "Jun", occupancyRate: 92, revenue: 28800, bookings: 68, property: "Villa Oceana" },
  { month: "Jul", occupancyRate: 96, revenue: 31200, bookings: 73, property: "Villa Paradiso" },
  { month: "Aug", occupancyRate: 95, revenue: 30500, bookings: 72, property: "Villa Paradiso" },
  { month: "Sep", occupancyRate: 86, revenue: 25800, bookings: 60, property: "Villa Azure" },
  { month: "Oct", occupancyRate: 78, revenue: 22600, bookings: 52, property: "Villa Azure" },
  { month: "Nov", occupancyRate: 72, revenue: 20400, bookings: 46, property: "Villa Caldera" },
  { month: "Dec", occupancyRate: 80, revenue: 24500, bookings: 58, property: "Villa Sunset" },
];

export const averageStayData = [
  { property: "Villa Caldera", averageDays: 5.2, totalBookings: 120, revenue: 45600 },
  { property: "Villa Sunset", averageDays: 4.8, totalBookings: 145, revenue: 52300 },
  { property: "Villa Oceana", averageDays: 6.3, totalBookings: 98, revenue: 61200 },
  { property: "Villa Paradiso", averageDays: 7.1, totalBookings: 85, revenue: 72500 },
  { property: "Villa Azure", averageDays: 5.7, totalBookings: 112, revenue: 58400 },
];

export const seasonalTrendsData = [
  { season: "Winter", occupancyRate: 68, averageRate: 320, totalRevenue: 62400, property: "Villa Caldera" },
  { season: "Spring", occupancyRate: 82, averageRate: 290, totalRevenue: 78300, property: "Villa Sunset" },
  { season: "Summer", occupancyRate: 94, averageRate: 350, totalRevenue: 108500, property: "Villa Oceana" },
  { season: "Fall", occupancyRate: 78, averageRate: 275, totalRevenue: 68200, property: "Villa Azure" },
  { season: "Winter", occupancyRate: 72, averageRate: 310, totalRevenue: 58700, property: "Villa Paradiso" },
  { season: "Spring", occupancyRate: 86, averageRate: 300, totalRevenue: 82500, property: "Villa Caldera" },
  { season: "Summer", occupancyRate: 98, averageRate: 380, totalRevenue: 115200, property: "Villa Sunset" },
  { season: "Fall", occupancyRate: 80, averageRate: 285, totalRevenue: 72100, property: "Villa Oceana" },
];

// Format data for display in reports
export const formatOccupancyReportData = (data: any[], property: string = "all") => {
  if (property === "all") {
    return data;
  }
  
  // Filter data for specific property
  return data.filter(item => item.property === property);
};
