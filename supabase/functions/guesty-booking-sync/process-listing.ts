import { ListingProcessResult } from './types.ts';

export async function processListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<ListingProcessResult> {
  try {
    const { syncBookingsForListing } = await import('./booking-sync.ts');
    
    const result = await syncBookingsForListing(supabase, token, listingId);
    
    console.log(`Synced listing ${listingId}: ${result.total} bookings (${result.created} created, ${result.updated} updated, ${result.deleted} deleted)`);
    
    // Retrieve any new housekeeping tasks created during sync
    const { data: newTasks } = await supabase
      .from('housekeeping_tasks')
      .select('id, task_type, due_date')
      .eq('listing_id', listingId)
      .gt('created_at', new Date(Date.now() - 60000).toISOString()); // Tasks created in last minute
      
    if (newTasks?.length > 0) {
      console.log(`Generated ${newTasks.length} new housekeeping tasks for listing ${listingId}`);
    }
    
    return {
      listingId,
      success: true,
      bookingsCount: result.total
    };
  } catch (error) {
    console.error(`Error syncing bookings for listing ${listingId}:`, error);
    
    return {
      listingId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
