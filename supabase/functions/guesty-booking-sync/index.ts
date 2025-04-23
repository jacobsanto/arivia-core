
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { SyncResponse, GuestyBooking } from './types.ts';
import { createSyncLog, updateSyncLog } from './sync-log.ts';
import { handleError } from './error-handlers.ts';
import { processListings } from './listing-processor.ts';
import { corsHeaders } from './cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GUESTY_CLIENT_ID = Deno.env.get('GUESTY_CLIENT_ID')!;
const GUESTY_CLIENT_SECRET = Deno.env.get('GUESTY_CLIENT_SECRET')!;

// Constants
const MAX_RUNTIME_MS = 50000; // 50 seconds
const MAX_RETRIES = 3;
const DELAY_BETWEEN_LISTINGS_MS = 300;

async function getGuestyToken(): Promise<string> {
  try {
    const response = await fetch('https://open-api.guesty.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: GUESTY_CLIENT_ID,
        client_secret: GUESTY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('Error getting Guesty token:', err);
    throw new Error(`Failed to authenticate with Guesty: ${err instanceof Error ? err.message : String(err)}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const failedListings: string[] = [];
  let totalBookings = 0;
  let listingsSynced = 0;
  let listingsAttempted = 0;
  let hasPartialSuccess = false;

  // Create a sync log entry to track this operation
  let syncLog = null;
  try {
    const logData = {
      provider: 'guesty',
      sync_type: 'bookings',
      status: 'in_progress',
      start_time: new Date().toISOString(),
      message: 'Starting booking sync process'
    };
    syncLog = await createSyncLog(supabase, logData);
  } catch (error) {
    console.error('Failed to create sync log entry:', error);
  }

  try {
    // Parse request body
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (e) {
      console.warn('Failed to parse request body, using empty object', e);
    }
    
    const { listingId, syncAll, startIndex = 0, totalListings = 0 } = requestBody as any;

    // Get Guesty access token
    let token;
    try {
      token = await getGuestyToken();
    } catch (tokenError) {
      return handleError(tokenError, supabase, syncLog, startTime);
    }

    // Process different sync scenarios
    if (listingId) {
      // Process a single listing
      console.log(`Processing single listing: ${listingId}`);
      listingsAttempted = 1;
      
      try {
        const { results, totalBookingsSynced } = await processListings(
          supabase, token, [listingId], startTime, MAX_RUNTIME_MS
        );
        
        totalBookings = totalBookingsSynced;
        listingsSynced = results.filter(r => r.success).length;
        
        if (results.length > 0 && !results[0].success) {
          failedListings.push(listingId);
        }
      } catch (error) {
        console.error(`Failed to sync listing ${listingId}:`, error);
        failedListings.push(listingId);
      }
    } else {
      // Process all listings or a batch
      try {
        const { data: listings, error } = await supabase
          .from('guesty_listings')
          .select('id')
          .eq('is_deleted', false)
          .eq('sync_status', 'active')
          .range(startIndex, startIndex + 19); // Process 20 listings at a time
        
        if (error) {
          throw new Error(`Failed to fetch listings: ${error.message}`);
        }
        
        if (!listings || listings.length === 0) {
          throw new Error('No active listings found to sync');
        }
        
        const listingsToSync = listings.map(l => l.id);
        listingsAttempted = listingsToSync.length;
        
        console.log(`Processing ${listingsToSync.length} listings`);
        
        const { results, totalBookingsSynced, created, updated, deleted } = 
          await processListings(supabase, token, listingsToSync, startTime, MAX_RUNTIME_MS);
        
        totalBookings = totalBookingsSynced;
        listingsSynced = results.filter(r => r.success).length;
        
        // Collect failed listings
        results
          .filter(r => !r.success)
          .forEach(r => failedListings.push(r.listingId));
      } catch (error) {
        return handleError(error, supabase, syncLog, startTime);
      }
    }

    // Calculate stats
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Determine if this was a full or partial success
    hasPartialSuccess = failedListings.length > 0 && listingsSynced > 0;
    const syncStatus = failedListings.length > 0 ? (hasPartialSuccess ? 'partial' : 'error') : 'completed';
    let syncMessage = '';
    
    if (hasPartialSuccess) {
      syncMessage = `Partially synced ${totalBookings} bookings. ${listingsSynced} listings succeeded, ${failedListings.length} failed`;
    } else if (failedListings.length === 0) {
      syncMessage = `Successfully synced ${totalBookings} bookings across ${listingsSynced} listings`;
    } else {
      syncMessage = `Failed to sync any bookings. All ${listingsAttempted} listing attempts failed`;
    }

    // Update sync log
    if (syncLog?.id) {
      await updateSyncLog(supabase, syncLog.id, {
        status: syncStatus,
        end_time: new Date().toISOString(),
        message: syncMessage,
        entities_synced: totalBookings,
        sync_duration_ms: Date.now() - startTime,
        bookings_created: 0, // These would need to come from processListings
        bookings_updated: 0,
        bookings_deleted: 0
      });
    }

    const response: SyncResponse = {
      success: failedListings.length === 0,
      bookings_synced: totalBookings,
      listings_attempted: listingsAttempted,
      listings_synced: listingsSynced,
      failed_listings: failedListings,
      time_taken: formattedTime,
      warning: hasPartialSuccess ? "Some listings failed to sync" : undefined,
      message: syncMessage
    };

    // If all listings failed, return a 500 error
    const statusCode = hasPartialSuccess ? 200 : (failedListings.length === listingsAttempted && listingsAttempted > 0 ? 500 : 200);

    return new Response(JSON.stringify(response), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  } catch (error) {
    return handleError(error, supabase, syncLog, startTime);
  }
});
