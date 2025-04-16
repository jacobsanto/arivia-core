
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Calculates revenue for today
 * @returns A promise that resolves to the total revenue for today
 */
export const fetchTodayRevenue = async (): Promise<number> => {
  let revenueToday: number = 0;
  try {
    // Query the financial_reports table for today's revenue
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Use explicit type for the database query result
    const { data: financialData, error } = await supabase
      .from('financial_reports')
      .select('revenue')
      .eq('date', today)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching financial data:', error);
      return 0;
    }
    
    if (financialData?.revenue) {
      revenueToday = financialData.revenue;
    } else {
      // If no financial data exists for today, calculate an estimate from bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('check_in_date', today);
      
      if (bookingsError) {
        console.error('Error fetching bookings data:', bookingsError);
        return 0;
      }
        
      if (bookingsData && bookingsData.length > 0) {
        revenueToday = bookingsData.reduce((sum, booking) => sum + booking.total_price, 0);
      }
    }
  } catch (finError) {
    console.log('No financial data available for today:', finError);
    revenueToday = 0;
  }
  
  return revenueToday;
};
