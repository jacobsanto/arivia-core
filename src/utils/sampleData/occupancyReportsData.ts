
export const createSampleOccupancyReports = () => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  return [
    {
      month: currentMonth,
      property: "Villa Caldera",
      bookings: 12,
      occupancy_rate: 75,
      revenue: 4500,
      average_stay: 4.2
    },
    {
      month: currentMonth,
      property: "Villa Azure",
      bookings: 8,
      occupancy_rate: 68,
      revenue: 6800,
      average_stay: 6.1
    },
    {
      month: currentMonth,
      property: "Villa Sunset",
      bookings: 15,
      occupancy_rate: 82,
      revenue: 2400,
      average_stay: 3.8
    }
  ];
};
