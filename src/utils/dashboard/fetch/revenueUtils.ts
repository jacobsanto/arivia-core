
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Define specific interfaces to prevent excessive type inference
interface FinancialReport {
  revenue: number;
  date?: string;
  month?: string;
}

interface Booking {
  total_price: number;
}

/**
 * Calculates revenue for today
 * @returns A promise that resolves to the total revenue for today
 */
export const fetchTodayRevenue = async (): Promise<number> => {
  let revenueToday = 0;
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'MMM yyyy'); // Format matching the month column
    
    // First attempt to get financial data from financial_reports table
    const financialResult = await supabase
      .from('financial_reports')
      .select('revenue')
      .eq('month', currentMonth)
      .maybeSingle();
    
    if (financialResult.error) {
      console.error('Error fetching financial data:', financialResult.error);
      return 0;
    }
    
    // Check if we got financial data
    if (financialResult.data) {
      revenueToday = (financialResult.data as FinancialReport).revenue || 0;
    } else {
      // If no financial data exists for today, calculate an estimate from bookings
      const bookingsResult = await supabase
        .from('bookings')
        .select('total_price')
        .eq('check_in_date', today);
      
      if (bookingsResult.error) {
        console.error('Error fetching bookings data:', bookingsResult.error);
        return 0;
      }
        
      // Calculate total from bookings
      if (bookingsResult.data && bookingsResult.data.length > 0) {
        revenueToday = (bookingsResult.data as Booking[]).reduce(
          (sum, booking) => sum + booking.total_price, 
          0
        );
      }
    }
  } catch (error) {
    console.error('Error calculating today\'s revenue:', error);
    revenueToday = 0;
  }
  
  return revenueToday;
};
