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
  let supabase: any;

  try {
    console.log('Starting guesty-sync function');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({
        success: false,
        message: 'Server configuration error: Missing required environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    console.log('Checking last sync status...');

    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const { data: recentSync, error: recentSyncError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .eq('status', 'completed')
      .gt('start_time', fifteenMinutesAgo.toISOString())
      .order('start_time', { ascending: false })
      .limit(1);

    if (recentSyncError) {
      console.error('Error checking recent syncs:', recentSyncError);
    }

    const { data: latestSync, error: latestSyncError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'guesty')
      .order('start_time', { ascending: false })
      .limit(1);
    
    if (latestSyncError) {
      console.error('Error checking latest sync:', latestSyncError);
    }
    
    const { data: integrationHealth, error: healthError } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();
    
    if (healthError) {
      console.error('Error fetching integration health:', healthError);
    }
    
    let backoffTime = 15;
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

    const nextRetryTime = new Date();
    nextRetryTime.setMinutes(nextRetryTime.getMinutes() + backoffTime);

    try {
      const { data: newSyncLog, error: syncLogError } = await supabase
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

      if (syncLogError) {
        console.error('Error creating sync log:', syncLogError);
        throw new Error(`Failed to create sync log: ${syncLogError.message}`);
      }

      syncLog = newSyncLog;
    } catch (err) {
      console.error('Failed to create sync log entry:', err);
    }

    console.log('Starting Guesty sync process...');

    let token;
    try {
      token = await getGuestyToken();
      console.log('Successfully obtained Guesty token');
    } catch (err) {
      console.error('Failed to obtain Guesty token:', err);
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed to obtain Guesty token', startTime);
      }
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to authenticate with Guesty API',
        error: err instanceof Error ? err.message : String(err)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let listings = [];
    let rateLimitInfo = null;

    try {
      const result = await syncGuestyListings(supabase, token);
      listings = result.listings || [];
      rateLimitInfo = result.rateLimitInfo;
      
      console.log(`Listings count: ${listings.length}`);
      
      if (rateLimitInfo) {
        await storeRateLimitInfo(supabase, 'listings', rateLimitInfo);
      }
    } catch (err) {
      console.error('Failed to sync listings:', err);
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed to sync listings', startTime);
      }
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to sync listings from Guesty',
        error: err instanceof Error ? err.message : String(err)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (listings.length === 0) {
      console.warn('No listings found in Guesty API response');
    }

    console.log(`Syncing bookings for ${listings.length} listings...`);
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
      console.log('All booking sync operations completed');
    } catch (err) {
      console.error('Error in booking sync operations:', err);
      if (syncLog?.id) {
        await updateSyncLogError(supabase, syncLog.id, 'Failed during booking sync operations', startTime);
      }
      return new Response(JSON.stringify({
        success: false,
        message: 'Error occurred during booking synchronization',
        error: err instanceof Error ? err.message : String(err)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const totalBookingsSynced = bookingResults
      .filter(result => result.status === 'fulfilled')
      .reduce((total, result) => total + (result as PromiseFulfilledResult<number>).value, 0);
    
    console.log(`Total bookings synced: ${totalBookingsSynced}`);

    const failedBookings = bookingResults.filter(result => result.status === 'rejected').length;
    if (failedBookings > 0) {
      console.warn(`Failed to sync bookings for ${failedBookings} listings`);
    }

    try {
      const { error: updateError } = await supabase
        .from('sync_logs')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          items_count: listings.length + totalBookingsSynced,
          sync_duration: Date.now() - startTime,
          message: `Successfully synced ${listings.length} listings and ${totalBookingsSynced} bookings${
            failedBookings > 0 ? ` (${failedBookings} booking syncs failed)` : ''
          }`,
          sync_type: 'full_sync',
          retry_count: 0
        })
        .eq('id', syncLog.id);
      
      if (updateError) {
        console.error('Error updating sync log:', updateError);
      }
    } catch (err) {
      console.error('Failed to update sync log:', err);
    }

    try {
      const { error: healthUpdateError } = await supabase
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
      
      if (healthUpdateError) {
        console.error('Error updating integration health:', healthUpdateError);
      } else {
        console.log('Successfully updated integration health status');
      }
    } catch (err) {
      console.error('Failed to update integration health:', err);
    }

    console.log('Sync completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sync completed successfully',
      listingsCount: listings.length,
      bookingsSynced: totalBookingsSynced
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected sync error:', error);
    
    const isRateLimit = errorMessage.includes('Too Many Requests') || errorMessage.includes('429');

    if (syncLog?.id && supabase) {
      await updateSyncLogError(supabase, syncLog.id, errorMessage, startTime, isRateLimit ? (syncLog.retry_count || 0) + 1 : syncLog.retry_count || 0);
    }

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'error',
          last_error: errorMessage,
          updated_at: new Date().toISOString(),
          is_rate_limited: isRateLimit
        }, {
          onConflict: 'provider'
        });
    } catch (err) {
      console.error('Error updating integration health for failed sync:', err);
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      isRateLimit: isRateLimit
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function updateSyncLogError(supabase: any, syncLogId: string, errorMessage: string, startTime: number, retryCount?: number) {
  try {
    await supabase
      .from('sync_logs')
      .update({
        status: 'error',
        end_time: new Date().toISOString(),
        message: errorMessage,
        sync_type: 'full_sync',
        sync_duration: Date.now() - startTime,
        retry_count: retryCount
      })
      .eq('id', syncLogId);
  } catch (err) {
    console.error('Failed to update sync log with error details:', err);
  }
}

async function storeRateLimitInfo(supabase: any, endpoint: string, rateLimitInfo: RateLimitInfo) {
  try {
    const { error } = await supabase
      .from('guesty_api_usage')
      .insert({
        endpoint,
        rate_limit: rateLimitInfo.rate_limit,
        remaining: rateLimitInfo.remaining,
        reset: rateLimitInfo.reset,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing rate limit info:', error);
    }
  } catch (error) {
    console.error('Exception while storing rate limit info:', error);
  }
}
