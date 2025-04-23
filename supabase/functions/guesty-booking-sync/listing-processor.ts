
import { ProcessingResult, ListingProcessResult } from './types.ts';

// Maximum listings to process in one batch
const MAX_LISTINGS_PER_BATCH = 25;

export async function processListings(
  supabase: any,
  token: string,
  listingIds: string[],
  startTime: number,
  maxRuntimeMs: number
): Promise<ProcessingResult> {
  const results: ListingProcessResult[] = [];
  let created = 0;
  let updated = 0;
  let deleted = 0;
  let totalBookingsSynced = 0;
  let processedCount = 0;
  
  console.log(`Processing ${listingIds.length} listings with max runtime: ${maxRuntimeMs}ms`);

  // Limit the batch size to avoid overwhelming the API
  const listingsToProcess = listingIds.slice(0, MAX_LISTINGS_PER_BATCH);
  const skippedCount = listingIds.length - listingsToProcess.length;
  
  if (skippedCount > 0) {
    console.log(`Limiting batch to ${MAX_LISTINGS_PER_BATCH} listings. Skipping ${skippedCount} listings.`);
  }

  // Import the processListing function
  const { processListing } = await import('./process-listing.ts');
  
  for (let i = 0; i < listingsToProcess.length; i++) {
    // Check if we're approaching the max runtime
    const elapsedMs = Date.now() - startTime;
    const remainingMs = maxRuntimeMs - elapsedMs;
    
    // Leave 5 seconds buffer for cleanup operations
    if (remainingMs < 5000) {
      console.log(`Approaching max runtime (${elapsedMs}/${maxRuntimeMs}ms). Stopping batch.`);
      break;
    }
    
    const listingId = listingsToProcess[i];
    console.log(`Processing listing ${i + 1}/${listingsToProcess.length}: ${listingId}`);
    
    try {
      const result = await processListing(supabase, token, listingId, i > 0);
      results.push(result);
      processedCount++;
      
      if (result.success) {
        // Get booking result details
        const { syncBookingsForListing } = await import('./booking-sync.ts');
        try {
          const bookingResult = await syncBookingsForListing(supabase, token, listingId);
          totalBookingsSynced += bookingResult.total || 0;
          created += bookingResult.created || 0;
          updated += bookingResult.updated || 0;
          deleted += bookingResult.deleted || 0;
        } catch (err) {
          console.error(`Could not get booking stats for listing ${listingId}:`, err);
        }
      }
    } catch (error) {
      console.error(`Error processing listing ${listingId}:`, error);
      results.push({
        listingId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      processedCount++;
    }
  }
  
  // Store metadata about skipped listings if needed
  if (skippedCount > 0) {
    try {
      await supabase
        .from('system_settings')
        .upsert({
          category: 'sync_metadata',
          settings: {
            skipped_listings: skippedCount,
            next_sync_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins
            last_update: new Date().toISOString()
          }
        }, { onConflict: 'category' });
    } catch (error) {
      console.error('Error storing skipped listings metadata:', error);
    }
  }
  
  return {
    results,
    totalBookingsSynced,
    created,
    updated,
    deleted,
  };
}
