
// Main orchestration for full sync, extracted from index.ts for maintainability
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings/syncBookings.ts';
import { updateIntegrationHealth, storeRateLimitInfo } from './integration-health.ts';
import { updateSyncLogError, updateSyncLogSuccess } from './sync-log.ts';
import { RateLimitInfo } from './utils.ts';

export async function orchestrateFullSync({ supabase, syncLog, startTime }: {
  supabase: any,
  syncLog: any,
  startTime: number
}): Promise<{ response: object, status: number }> {
  let integrationHealth: any;
  try {
    const { data, error } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();
    if (error) {
      console.error('Error fetching integration health:', error);
    }
    integrationHealth = data;
  } catch (e) {
    console.error('Failed to load integration health', e);
  }
  let token;
  try {
    token = await getGuestyToken();
  } catch (err) {
    if (syncLog?.id) {
      await updateSyncLogError(supabase, syncLog.id, 'Failed to obtain Guesty token', startTime);
    }
    return {
      response: { success: false, message: 'Failed to authenticate with Guesty API', error: err instanceof Error ? err.message : String(err) },
      status: 500
    };
  }
  let listings = [];
  let rateLimitInfo: RateLimitInfo | null = null;
  try {
    const result = await syncGuestyListings(supabase, token);
    listings = result.listings || [];
    rateLimitInfo = result.rateLimitInfo;
    if (rateLimitInfo) {
      await storeRateLimitInfo(supabase, 'listings', rateLimitInfo);
    }
  } catch (err) {
    if (syncLog?.id) {
      await updateSyncLogError(supabase, syncLog.id, 'Failed to sync listings', startTime);
    }
    return {
      response: { success: false, message: 'Failed to sync listings from Guesty', error: err instanceof Error ? err.message : String(err) },
      status: 500
    };
  }
  // Sync bookings for all listings
  const bookingSyncPromises = listings.map(listing => 
    syncGuestyBookingsForListing(supabase, token, listing._id)
      .catch(err => {
        console.error(`Error syncing bookings for listing ${listing._id}:`, err);
        return 0;
      })
  );
  let bookingResults;
  try {
    bookingResults = await Promise.allSettled(bookingSyncPromises);
  } catch (err) {
    if (syncLog?.id) {
      await updateSyncLogError(supabase, syncLog.id, 'Failed during booking sync operations', startTime);
    }
    return {
      response: { success: false, message: 'Error occurred during booking synchronization', error: err instanceof Error ? err.message : String(err) },
      status: 500
    };
  }
  const totalBookingsSynced = bookingResults
    .filter(result => result.status === 'fulfilled')
    .reduce((total, result) => total + (result as PromiseFulfilledResult<number>).value, 0);
  const failedBookings = bookingResults.filter(result => result.status === 'rejected').length;
  if (syncLog?.id) {
    await updateSyncLogSuccess(
      supabase, 
      syncLog.id, 
      startTime, 
      listings.length, 
      totalBookingsSynced,
      failedBookings
    );
  }
  await updateIntegrationHealth(
    supabase, 
    'connected', 
    rateLimitInfo, 
    integrationHealth
  );
  return {
    response: { 
      success: true, 
      message: 'Sync completed successfully',
      listingsCount: listings.length,
      bookingsSynced: totalBookingsSynced
    },
    status: 200
  };
}
