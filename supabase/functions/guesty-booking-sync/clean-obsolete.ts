
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  activeBookings: any[]
): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeIds = new Set(activeBookings.map(b => b.id || b._id));
    
    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
    
    if (error) {
      console.error(`[GuestyBookingSync] Error querying local bookings for obsolete cleanup for listing ${listingId}:`, error);
      return 0;
    }
    
    if (!localBookings || localBookings.length === 0) return 0;
    
    const bookingsToCancel = localBookings.filter(b => !activeIds.has(b.id));
    if (bookingsToCancel.length === 0) return 0;

    console.log(`[GuestyBookingSync] Marking ${bookingsToCancel.length} bookings as cancelled (obsolete)`);
    
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', bookingsToCancel.map(b => b.id));
    
    if (updateError) {
      console.error(`[GuestyBookingSync] Error cancelling obsolete bookings:`, updateError);
      return 0;
    }
    
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`[GuestyBookingSync] Error in cleanObsoleteBookings:`, error);
    return 0;
  }
}

