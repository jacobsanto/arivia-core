
import { syncBookingsForListing } from './booking-sync.ts';
import { delay } from './utils.ts';

export const processListings = async (
  supabase: any, 
  token: string, 
  listingsToSync: string[], 
  startTime: number,
  MAX_EXECUTION_TIME: number
) => {
  const results = [];
  let created = 0;
  let updated = 0;
  let deleted = 0;
  let totalBookingsSynced = 0;

  for (const id of listingsToSync) {
    try {
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(`[GuestyBookingSync] Approaching maximum execution time, stopping after ${results.length} listings`);
        break;
      }
      
      console.log(`Processing listing: ${id}`);
      const syncResult = await syncBookingsForListing(supabase, token, id);
      totalBookingsSynced += syncResult.total;
      created += syncResult.created;
      updated += syncResult.updated;
      deleted += syncResult.deleted;
      
      results.push({ 
        listingId: id, 
        bookingsSynced: syncResult.total, 
        created: syncResult.created,
        updated: syncResult.updated, 
        deleted: syncResult.deleted,
        endpoint: syncResult.endpoint,
        success: true 
      });
      
      if (listingsToSync.length > 1) {
        await delay(1000);
      }
    } catch (error) {
      console.error(`Error syncing bookings for listing ${id}:`, error);
      results.push({ 
        listingId: id, 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  }

  return { results, totalBookingsSynced, created, updated, deleted };
};
