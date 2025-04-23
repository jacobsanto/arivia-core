
import { delay } from './utils.ts';
import { processListing } from './process-listing.ts';
import { ListingProcessResult, ProcessingResult } from './types.ts';

export async function processBatch(
  supabase: any,
  token: string,
  listingIds: string[],
  startTime: number,
  maxRuntime: number
): Promise<ProcessingResult> {
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

    const result = await processListing(supabase, token, listingId);
    results.push(result);

    if (result.success && result.bookingsCount) {
      totalBookingsSynced += result.bookingsCount;
    }
    
    // Add a small delay between requests to avoid rate limiting
    if (listingIds.length > 1) {
      await delay(300);
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
