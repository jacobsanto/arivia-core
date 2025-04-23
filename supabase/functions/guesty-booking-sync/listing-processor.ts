
import { corsHeaders } from './cors.ts';
import { ListingProcessResult } from './types.ts';

export async function processListings(
  supabase: any,
  token: string,
  listingIds: string[],
  startTime: number,
  maxRuntime: number
) {
  const results: ListingProcessResult[] = [];
  let totalBookingsSynced = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalDeleted = 0;

  for (const listingId of listingIds) {
    // Check if we're nearing the edge function timeout
    if (Date.now() - startTime > maxRuntime) {
      console.log(`Approaching max runtime, processed ${results.length}/${listingIds.length} listings`);
      break;
    }

    try {
      const { syncBookingsForListing } = await import('./booking-sync.ts');
      
      const result = await syncBookingsForListing(supabase, token, listingId);
      
      console.log(`Synced listing ${listingId}: ${result.total} bookings (${result.created} created, ${result.updated} updated, ${result.deleted} deleted)`);
      
      totalBookingsSynced += result.total;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalDeleted += result.deleted;
      
      results.push({
        listingId,
        success: true,
        bookingsCount: result.total
      });
    } catch (error) {
      console.error(`Error syncing bookings for listing ${listingId}:`, error);
      
      results.push({
        listingId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Add a small delay between requests to avoid rate limiting
    if (listingIds.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return {
    results,
    totalBookingsSynced,
    created: totalCreated,
    updated: totalUpdated,
    deleted: totalDeleted
  };
}

