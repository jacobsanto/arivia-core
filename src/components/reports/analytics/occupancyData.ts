
import { OccupancyReport } from "@/services/analytics/analytics.service";

// Format occupancy data for report visualization
export const formatOccupancyReportData = (data: OccupancyReport[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};

// Transform occupancy data for monthly display
export const getMonthlyOccupancyData = (data: OccupancyReport[]) => {
  return data.map(item => ({
    name: item.month,
    occupancy: item.occupancy_rate,
    revenue: item.revenue,
    bookings: item.bookings
  }));
};

// Group occupancy data by property
export const getOccupancyByPropertyData = (data: OccupancyReport[]) => {
  const propertyMap: Record<string, { total: number, count: number }> = {};
  
  // Calculate average occupancy by property
  data.forEach(item => {
    if (!propertyMap[item.property]) {
      propertyMap[item.property] = { total: 0, count: 0 };
    }
    
    propertyMap[item.property].total += item.occupancy_rate;
    propertyMap[item.property].count += 1;
  });
  
  // Convert to array for chart display
  return Object.entries(propertyMap).map(([property, { total, count }]) => ({
    name: property,
    occupancy: Math.round(total / count),
    value: Math.round(total / count) // For pie charts
  }));
};
