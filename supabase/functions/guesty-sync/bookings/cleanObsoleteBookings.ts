
import { GuestyBooking } from '../types.ts';

/**
 * Find local bookings not present in activeBookings and mark as cancelled for this listing.
 */
export async function cleanObsoleteBookings(supabase: any, listingId: string, activeBookings: GuestyBooking[]) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeBookingIds = new Set(activeBookings.map(b => b._id));
    const { data: localBookings, error: queryError } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
    if (queryError) {
      console.error(`Error querying local bookings for listing ${listingId}:`, queryError);
      return;
    }
    if (localBookings && localBookings.length > 0) {
      const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
      if (bookingsToCancel.length > 0) {
        const { error: updateError } = await supabase
          .from('guesty_bookings')
          .update({
            status: 'cancelled',
            last_synced: new Date().toISOString()
          })
          .in('id', bookingsToCancel.map(b => b.id));
        if (updateError) {
          console.error(`Error cancelling obsolete bookings for listing ${listingId}:`, updateError);
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    throw error;
  }
}
