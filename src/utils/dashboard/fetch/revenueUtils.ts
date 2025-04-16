
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Define specific types to prevent excessive type inference
interface FinancialReportData {
  revenue: number;
}

interface BookingData {
  total_price: number;
}

/**
 * Calculates revenue for today
 * @returns A promise that resolves to the total revenue for today
 */
export const fetchTodayRevenue = async (): Promise<number> => {
  let revenueToday = 0;
  try {
    // Query the financial_reports table for today's revenue
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // First attempt to get financial data
    const financialResult = await supabase
      .from('financial_reports')
      .select('revenue')
      .eq('date', today)
      .maybeSingle();
    
    if (financialResult.error) {
      console.error('Error fetching financial data:', financialResult.error);
      return 0;
    }
    
    // Check if we got financial data
    if (financialResult.data) {
      revenueToday = (financialResult.data as FinancialReportData).revenue || 0;
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
        revenueToday = (bookingsResult.data as BookingData[]).reduce(
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
