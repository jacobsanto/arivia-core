
export async function cleanObsoleteBookings(
  supabase: any, 
  listingId: string, 
  remoteBookings: any[]
): Promise<number> {
  try {
    // Extract IDs of current bookings from remote response
    const activeBookingIds = new Set(remoteBookings.map(b => b.id));
    
    // Find bookings in our database for this listing that are no longer in Guesty
    const { data: obsoleteBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .not('id', 'in', `(${Array.from(activeBookingIds).join(',')})`);
      
    if (error) {
      console.error(`Error finding obsolete bookings for listing ${listingId}:`, error);
      return 0;
    }
    
    if (!obsoleteBookings || obsoleteBookings.length === 0) {
      return 0;
    }
    
    // Delete obsolete bookings
    const obsoleteIds = obsoleteBookings.map(b => b.id);
    const { error: deleteError } = await supabase
      .from('guesty_bookings')
      .delete()
      .in('id', obsoleteIds);
      
    if (deleteError) {
      console.error(`Error deleting obsolete bookings for listing ${listingId}:`, deleteError);
      return 0;
    }
    
    return obsoleteBookings.length;
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    return 0;
  }
}
