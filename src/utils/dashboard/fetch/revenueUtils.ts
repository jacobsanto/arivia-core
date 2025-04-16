
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Calculates revenue for today
 */
export const fetchTodayRevenue = async () => {
  let revenueToday = 0;
  try {
    // Query the financial_reports table for today's revenue
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: financialData } = await supabase
      .from('financial_reports')
      .select('revenue')
      .eq('date', today)
      .maybeSingle();
    
    revenueToday = financialData?.revenue || 0;
    
    // If no financial data exists for today, calculate an estimate from bookings
    if (!financialData) {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('check_in_date', today);
        
      revenueToday = bookingsData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0;
    }
  } catch (finError) {
    console.log('No financial data available for today:', finError);
  }
  
  return revenueToday;
};
