import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings.ts';
import { RateLimitInfo, SyncStatus, calculateNextRetryTime } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let syncLog;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking last sync status...');

    // Check for recent successful syncs
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const { data: recentSync } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .eq('status', 'completed')
      .gt('start_time', fifteenMinutesAgo.toISOString())
      .order('start_time', { ascending: false })
      .limit(1);

    // Get the latest sync regardless of status for backoff calculation
    const { data: latestSync } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .order('start_time', { ascending: false })
      .limit(1);
    
    // Get integration health record
    const { data: integrationHealth } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();
    
    // Calculate backoff time based on previous failures
    let backoffTime = 15; // Default 15 minutes in minutes
    let retryCount = 0;
    let rateLimited = false;

    if (latestSync && latestSync.length > 0) {
      retryCount = latestSync[0].retry_count || 0;
      
      if (latestSync[0].status === 'error') {
        if (latestSync[0].message && latestSync[0].message.includes('Too Many Requests')) {
          rateLimited = true;
          retryCount++;
        }
      }
    }

    // Calculate backoff time if we hit rate limits
    if (rateLimited) {
      backoffTime = calculateNextRetryTime(retryCount);
    } else if (recentSync && recentSync.length > 0) {
      console.log('Recent sync found, enforcing cooldown period');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please wait before syncing again. A sync was performed in the last 15 minutes.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    // If we're still in backoff period due to rate limits
    if (rateLimited && latestSync && latestSync.length > 0) {
      const nextRetryTime = new Date(latestSync[0].next_retry_time || latestSync[0].start_time);
      nextRetryTime.setMinutes(nextRetryTime.getMinutes() + backoffTime);
      
      if (nextRetryTime > new Date()) {
        const waitTimeMinutes = Math.ceil((nextRetryTime.getTime() - Date.now()) / (60 * 1000));
        return new Response(
          JSON.stringify({
            success: false,
            message: `Rate limit cooldown in effect. Please wait approximately ${waitTimeMinutes} minutes before retrying.`,
            nextRetryTime: nextRetryTime.toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }
    }

    // Create new sync log entry
    const nextRetryTime = new Date();
    nextRetryTime.setMinutes(nextRetryTime.getMinutes() + backoffTime);

    const { data: newSyncLog } = await supabase
      .from('sync_logs')
      .insert({
        service: 'guesty',
        sync_type: 'full_sync',
        status: 'in_progress',
        start_time: new Date().toISOString(),
        message: 'Starting Guesty full sync process',
        retry_count: rateLimited ? retryCount : 0,
        next_retry_time: nextRetryTime.toISOString()
      })
      .select()
      .single();

    syncLog = newSyncLog;

    console.log('Starting Guesty sync process...');

    // Get token using the caching logic
    const token = await getGuestyToken();
    
    // Sync listings
    const { listings, rateLimitInfo } = await syncGuestyListings(supabase, token);

    // Store rate limit information
    if (rateLimitInfo) {
      await storeRateLimitInfo(supabase, 'listings', rateLimitInfo);
    }

    // Sync bookings for each listing
    console.log(`Syncing bookings for ${listings.length} listings...`);
    const bookingSyncPromises = listings.map(listing => 
      syncGuestyBookingsForListing(supabase, token, listing._id)
    );
    
    const bookingResults = await Promise.allSettled(bookingSyncPromises);

    // Calculate total bookings synced
    const totalBookingsSynced = bookingResults
      .filter(result => result.status === 'fulfilled')
      .reduce((total, result) => total + (result as PromiseFulfilledResult<number>).value, 0);

    // Update sync log with results
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        items_count: listings.length + totalBookingsSynced,
        sync_duration: Date.now() - startTime,
        message: `Successfully synced ${listings.length} listings and ${totalBookingsSynced} bookings`,
        sync_type: 'full_sync',
        retry_count: 0 // Reset retry count on successful sync
      })
      .eq('id', syncLog.id);

    // Update integration health
    await supabase
      .from('integration_health')
      .upsert({
        provider: 'guesty',
        status: 'connected',
        last_synced: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
        remaining_requests: rateLimitInfo?.remaining || null,
        rate_limit_reset: rateLimitInfo?.reset || null,
        request_count: (integrationHealth?.request_count || 0) + 1
      }, {
        onConflict: 'provider'
      });

    console.log('Sync completed successfully');

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sync completed successfully',
      listingsCount: listings.length,
      bookingsSynced: totalBookingsSynced
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync error:', error);
    const isRateLimit = error.message?.includes('Too Many Requests') || error.message?.includes('429');

    // Update sync log with error details
    if (syncLog?.id) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'error',
          end_time: new Date().toISOString(),
          message: error.message,
          sync_type: 'full_sync',
          sync_duration: Date.now() - startTime,
          retry_count: isRateLimit ? (syncLog.retry_count || 0) + 1 : syncLog.retry_count || 0
        })
        .eq('id', syncLog.id);
    }

    // Update integration health for failed sync
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from('integration_health')
      .upsert({
        provider: 'guesty',
        status: 'error',
        last_error: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
        is_rate_limited: isRateLimit
      }, {
        onConflict: 'provider'
      });

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      isRateLimit: isRateLimit
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function storeRateLimitInfo(supabase: any, endpoint: string, rateLimitInfo: RateLimitInfo) {
  try {
    await supabase
      .from('guesty_api_usage')
      .insert({
        endpoint,
        rate_limit: rateLimitInfo.rate_limit,
        remaining: rateLimitInfo.remaining,
        reset: rateLimitInfo.reset,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error storing rate limit info:', error);
  }
}
