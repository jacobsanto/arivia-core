
// Placeholder for occupancy data until we fully integrate with the database

export const occupancyData = [
  { 
    month: "January", 
    property: "Villa Caldera", 
    occupancyRate: 75,
    bookings: 24,
    revenue: 15000,
    averageStay: 5.2
  },
  { 
    month: "February", 
    property: "Villa Caldera", 
    occupancyRate: 82,
    bookings: 28,
    revenue: 12000,
    averageStay: 4.8
  }
];

// Helper function to format data for charts
export const formatOccupancyReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};
