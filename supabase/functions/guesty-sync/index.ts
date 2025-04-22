
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings.ts';
import { RateLimitInfo } from './utils.ts';
import { updateSyncLogError, updateSyncLogSuccess, createSyncLog } from './sync-log.ts';
import { updateIntegrationHealth, storeRateLimitInfo } from './integration-health.ts';
import { checkSyncCooldown } from './cooldown.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    // Validate environment configuration
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

    // Initialize Supabase client
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    // Check integration health
    const { data: integrationHealth, error: healthError } = await supabase
      .from('integration_health')
      .select('*')
      .eq('provider', 'guesty')
      .single();
    
    if (healthError) {
      console.error('Error fetching integration health:', healthError);
    }
    
    // Check cooldown and rate limiting
    const cooldownCheck = await checkSyncCooldown(supabase);
    
    if (!cooldownCheck.canProceed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: cooldownCheck.message,
          nextRetryTime: cooldownCheck.nextRetryTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: cooldownCheck.status || 429
        }
      );
    }

    // Calculate next retry time
    const nextRetryTime = new Date();
    nextRetryTime.setMinutes(nextRetryTime.getMinutes() + cooldownCheck.backoffTime);

    // Create sync log entry
    try {
      const { data: newSyncLog, error: syncLogError } = await createSyncLog(
        supabase, 
        cooldownCheck.retryCount, 
        nextRetryTime
      );

      if (syncLogError) {
        console.error('Error creating sync log:', syncLogError);
        throw new Error(`Failed to create sync log: ${syncLogError.message}`);
      }

      syncLog = newSyncLog;
    } catch (err) {
      console.error('Failed to create sync log entry:', err);
    }

    console.log('Starting Guesty sync process...');

    // Get Guesty authentication token
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
    
    // Sync Guesty listings
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

    // Sync bookings for all listings
    console.log(`Syncing bookings for ${listings.length} listings...`);
    const bookingSyncPromises = listings.map(listing => 
      syncGuestyBookingsForListing(supabase, token, listing._id)
        .catch(err => {
          console.error(`Error syncing bookings for listing ${listing._id}:`, err);
          return 0;
        })
    );
    
    // Process booking sync results
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

    // Calculate sync statistics
    const totalBookingsSynced = bookingResults
      .filter(result => result.status === 'fulfilled')
      .reduce((total, result) => total + (result as PromiseFulfilledResult<number>).value, 0);
    
    console.log(`Total bookings synced: ${totalBookingsSynced}`);

    const failedBookings = bookingResults.filter(result => result.status === 'rejected').length;
    if (failedBookings > 0) {
      console.warn(`Failed to sync bookings for ${failedBookings} listings`);
    }

    // Update sync log with success information
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

    // Update integration health status
    await updateIntegrationHealth(
      supabase, 
      'connected', 
      rateLimitInfo, 
      integrationHealth
    );

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

    // Update sync log with error
    if (syncLog?.id && supabase) {
      await updateSyncLogError(
        supabase, 
        syncLog.id, 
        errorMessage, 
        startTime, 
        isRateLimit ? (syncLog.retry_count || 0) + 1 : syncLog.retry_count || 0
      );
    }

    // Update integration health status
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await updateIntegrationHealth(
        supabase, 
        'error', 
        null, 
        null, 
        errorMessage
      );
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
