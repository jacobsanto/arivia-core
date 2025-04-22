
// Main orchestration logic for full Guesty sync.
// This is extracted out of index.ts for cleaner design and better testability.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings.ts';
import { RateLimitInfo } from './utils.ts';
import { updateSyncLogError, updateSyncLogSuccess, createSyncLog } from './sync-log.ts';
import { updateIntegrationHealth, storeRateLimitInfo } from './integration-health.ts';
import { checkSyncCooldown } from './cooldown.ts';

// Centralized sync entry point
export async function orchestrateFullGuestySync(): Promise<{ response: object, status: number }> {
  const startTime = Date.now();
  let supabase;
  let syncLog;

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables.');
      return {
        response: { success: false, message: 'Server configuration error: Missing Supabase env vars' },
        status: 500
      };
    }
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cooldowns/rate limits before continuing!
    const cooldownResult = await checkSyncCooldown(supabase);
    if (!cooldownResult.canProceed) {
      return {
        response: {
          success: false,
          message: cooldownResult.message,
          nextRetryTime: cooldownResult.nextRetryTime,
          retryCount: cooldownResult.retryCount,
          backoffTime: cooldownResult.backoffTime,
        },
        status: cooldownResult.status || 429
      };
    }

    // Optionally: create sync log early (for audit)
    syncLog = await createSyncLog(supabase, cooldownResult.retryCount, new Date(Date.now() + cooldownResult.backoffTime * 60000));
    if (syncLog?.error) {
      console.error('Failed to create sync log:', syncLog.error);
      syncLog = undefined;
    } else if (syncLog?.data) {
      syncLog = syncLog.data;
    }

    // Authentication
    let token;
    try {
      token = await getGuestyToken();
    } catch (err) {
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed to obtain Guesty token', startTime, cooldownResult.retryCount);
      }
      return {
        response: { success: false, message: 'Failed to authenticate with Guesty API', error: err instanceof Error ? err.message : String(err) },
        status: 500
      };
    }

    // Fetch/listings sync
    let listings: any[] = [];
    let rateLimitInfo: RateLimitInfo | null = null;
    try {
      const listingsRes = await syncGuestyListings(supabase, token);
      listings = listingsRes.listings || [];
      rateLimitInfo = listingsRes.rateLimitInfo;
      if (rateLimitInfo) await storeRateLimitInfo(supabase, 'listings', rateLimitInfo);
    } catch (err) {
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed to sync listings', startTime, cooldownResult.retryCount);
      }
      return {
        response: { success: false, message: 'Failed to fetch/sync listings', error: err instanceof Error ? err.message : String(err) },
        status: 500
      };
    }

    // Bookings sync for all active listings
    const bookingSyncPromises = listings.map(listing =>
      syncGuestyBookingsForListing(supabase, token, listing._id).catch(err => {
        console.error(`Error syncing bookings for listing ${listing._id}:`, err);
        return 0;
      })
    );
    let bookingResults;
    try {
      bookingResults = await Promise.allSettled(bookingSyncPromises);
    } catch (err) {
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed during booking sync', startTime, cooldownResult.retryCount);
      }
      return {
        response: { success: false, message: 'Error occurred during booking synchronization', error: err instanceof Error ? err.message : String(err) },
        status: 500
      };
    }
    const totalBookingsSynced = bookingResults.filter(res => res.status === 'fulfilled')
      .reduce((total, res) => total + (res as PromiseFulfilledResult<number>).value, 0);
    const failedBookings = bookingResults.filter(r => r.status === 'rejected').length;

    // Success log update
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
    await updateIntegrationHealth(supabase, 'connected', rateLimitInfo, null);

    return {
      response: {
        success: true,
        message: 'Sync completed successfully',
        listingsCount: listings.length,
        bookingsSynced: totalBookingsSynced,
        failedBookings
      },
      status: 200
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Guesty sync';
    if (syncLog?.id && supabase) {
      await updateSyncLogError(supabase, syncLog.id, errorMessage, startTime);
    }
    return {
      response: { success: false, error: errorMessage },
      status: 500
    };
  }
}
