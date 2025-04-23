
import { supabase } from '@supabase/supabase-js';
import { ListingProcessResult } from './types';

export async function processListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<ListingProcessResult> {
  try {
    const { syncBookingsForListing } = await import('./booking-sync');
    
    const result = await syncBookingsForListing(supabase, token, listingId);
    
    console.log(`Synced listing ${listingId}: ${result.total} bookings (${result.created} created, ${result.updated} updated, ${result.deleted} deleted)`);
    
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
