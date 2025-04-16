
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

// Monthly occupancy data for all properties
export const monthlyOccupancyData = [
  { month: "Jan", property: "Villa Caldera", occupancyRate: 75, bookings: 24 },
  { month: "Feb", property: "Villa Caldera", occupancyRate: 82, bookings: 28 },
  { month: "Mar", property: "Villa Caldera", occupancyRate: 88, bookings: 30 },
  { month: "Apr", property: "Villa Caldera", occupancyRate: 92, bookings: 32 },
  { month: "May", property: "Villa Caldera", occupancyRate: 95, bookings: 33 },
  { month: "Jun", property: "Villa Caldera", occupancyRate: 98, bookings: 34 },
  
  { month: "Jan", property: "Villa Sunset", occupancyRate: 65, bookings: 20 },
  { month: "Feb", property: "Villa Sunset", occupancyRate: 72, bookings: 22 },
  { month: "Mar", property: "Villa Sunset", occupancyRate: 78, bookings: 24 },
  { month: "Apr", property: "Villa Sunset", occupancyRate: 82, bookings: 25 },
  { month: "May", property: "Villa Sunset", occupancyRate: 85, bookings: 26 },
  { month: "Jun", property: "Villa Sunset", occupancyRate: 88, bookings: 27 },
  
  { month: "Jan", property: "Villa Oceana", occupancyRate: 85, bookings: 28 },
  { month: "Feb", property: "Villa Oceana", occupancyRate: 87, bookings: 29 },
  { month: "Mar", property: "Villa Oceana", occupancyRate: 90, bookings: 30 },
  { month: "Apr", property: "Villa Oceana", occupancyRate: 94, bookings: 31 },
  { month: "May", property: "Villa Oceana", occupancyRate: 97, bookings: 32 },
  { month: "Jun", property: "Villa Oceana", occupancyRate: 99, bookings: 33 }
];

// Helper function to format data for charts
export const formatOccupancyReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};
