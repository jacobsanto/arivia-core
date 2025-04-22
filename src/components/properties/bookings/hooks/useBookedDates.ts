
import { useMemo } from "react";
import { useBookings } from "../useBookings";

export const useBookedDates = (propertyId: string) => {
  const { bookings } = useBookings(propertyId);

  const bookedDays = useMemo(() => {
    const days: Date[] = [];
    
    bookings.forEach(booking => {
      try {
        const checkInDate = new Date(booking.check_in_date);
        const checkOutDate = new Date(booking.check_out_date);
        
        // Skip invalid dates
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          console.warn("Invalid booking dates detected:", booking);
          return;
        }
        
        // Create a copy of the check-in date to iterate through
        const currentDate = new Date(checkInDate);
        
        // Iterate through each day between check-in and check-out
        while (currentDate.getTime() <= checkOutDate.getTime()) {
          days.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error("Error processing booking dates:", error);
      }
    });
    
    return days;
  }, [bookings]);

  return bookedDays;
};
