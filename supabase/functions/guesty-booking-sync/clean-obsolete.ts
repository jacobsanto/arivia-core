
/**
 * Removes obsolete bookings from the database that are no longer present in Guesty API
 */
export async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  activeBookingIds: Set<string> | string[]
): Promise<number> {
  try {
    // Convert array to Set if needed for consistent interface
    const activeIds = activeBookingIds instanceof Set ? activeBookingIds : new Set(activeBookingIds);
    const today = new Date().toISOString().split('T')[0];
    
    // Get local bookings for this listing that are future/active
    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today) // Only consider future/active bookings
      .neq('status', 'cancelled'); // Don't touch already cancelled bookings
    
    if (error) {
      console.error(`[GuestySync] Error querying local bookings for cleanup:`, error);
      return 0;
    }
    
    if (!localBookings || localBookings.length === 0) return 0;
    
    // Find bookings that are in our database but no longer in Guesty (deleted or cancelled)
    const bookingsToCancel = localBookings.filter(booking => !activeIds.has(booking.id));
    if (bookingsToCancel.length === 0) return 0;

    console.log(`[GuestySync] Marking ${bookingsToCancel.length} obsolete bookings as cancelled for listing ${listingId}`);
    
    // Update status to cancelled for obsolete bookings
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', bookingsToCancel.map(b => b.id));
    
    if (updateError) {
      console.error(`[GuestySync] Error cancelling obsolete bookings:`, updateError);
      return 0;
    }
    
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`[GuestySync] Error in cleanObsoleteBookings:`, error);
    return 0;
  }
}
