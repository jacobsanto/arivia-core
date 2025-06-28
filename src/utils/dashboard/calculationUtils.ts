
// Calculation utilities for dashboard
export const calculateOccupancyRate = (bookings: any[]): number => {
  if (!bookings.length) return 0;
  
  const totalDays = 30; // Assuming monthly calculation
  const occupiedDays = bookings.reduce((total, booking) => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
    return total + duration;
  }, 0);
  
  return (occupiedDays / totalDays) * 100;
};

export const generateFinancialSummary = (bookings: any[]) => {
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
  
  return {
    totalRevenue,
    averageBookingValue,
    totalBookings: bookings.length,
    monthlyGrowth: 12.5 // Mock growth percentage
  };
};

export const calculateTaskCompletion = (tasks: any[]): number => {
  if (!tasks.length) return 0;
  
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return (completedTasks / tasks.length) * 100;
};
