
export async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  remoteBookings: any[]
): Promise<number> {
  try {
    // Extract IDs from remote bookings
    const remoteIds = new Set(remoteBookings.map(b => b._id || b.id));
    
    // Get all local bookings for this listing that aren't marked as cancelled
    const today = new Date().toISOString().split('T')[0];
    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
    
    if (error) {
      console.error('Error fetching local bookings:', error);
      return 0;
    }
    
    if (!localBookings || localBookings.length === 0) {
      return 0;
    }
    
    // Filter out bookings that exist remotely
    const obsoleteIds = localBookings
      .filter(b => !remoteIds.has(b.id))
      .map(b => b.id);
    
    if (obsoleteIds.length === 0) {
      return 0;
    }
    
    console.log(`Marking ${obsoleteIds.length} obsolete bookings as cancelled`);
    
    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({ 
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', obsoleteIds);
    
    if (updateError) {
      console.error('Error updating obsolete bookings:', updateError);
      return 0;
    }
    
    return obsoleteIds.length;
  } catch (error) {
    console.error('Error in cleanObsoleteBookings:', error);
    return 0;
  }
}
