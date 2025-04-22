
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { syncBookingsForListing } from './booking-sync.ts';
import { createSyncLog, updateSyncLog, updateIntegrationHealth } from './sync-log.ts';
import { delay } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum execution time to leave some buffer (Edge functions timeout at 60s)
const MAX_EXECUTION_TIME = 50000; // 50 seconds in ms

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let totalBookingsSynced = 0;
  let syncLog;
  let supabase;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    const listingId = requestData.listingId;
    const syncAll = requestData.syncAll === true;
    
    console.log(`Starting Guesty bookings sync process...`);
    
    syncLog = await createSyncLog(supabase, {
      service: 'guesty',
      sync_type: syncAll ? 'full_bookings_sync' : 'single_listing_bookings',
      status: 'in_progress',
      start_time: new Date().toISOString(),
      message: syncAll 
        ? 'Starting Guesty bookings full sync process' 
        : `Starting sync for listing ${listingId}`
    });
    
    const token = await getGuestyToken();
    
    let listingsToSync: string[] = [];
    
    if (syncAll) {
      // When syncing all listings, we will process them in batches to avoid timeout
      const { data: listings, error: listingsError } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active');
      
      if (listingsError) {
        throw new Error(`Failed to fetch listings: ${listingsError.message}`);
      }
        
      listingsToSync = listings?.map(listing => listing.id) || [];
      console.log(`Found ${listingsToSync.length} active listings to sync bookings for`);
      
      // Handle the first batch in this function call (up to 3 listings)
      // Additional listings will need to be synced in separate function calls
      listingsToSync = listingsToSync.slice(0, 3);
      
      // Record the total count for logging
      const totalListingsCount = listings?.length || 0;
      const remainingListings = totalListingsCount - listingsToSync.length;
      
      if (remainingListings > 0) {
        console.log(`Processing first ${listingsToSync.length} listings in this run. ${remainingListings} listings will need additional sync requests.`);
      }
    } else if (listingId) {
      listingsToSync = [listingId];
    } else {
      throw new Error('Either listingId or syncAll must be provided');
    }
    
    if (listingsToSync.length === 0) {
      throw new Error('No listings found to sync');
    }
    
    const results = [];
    let created = 0;
    let updated = 0;
    let deleted = 0;
    
    for (const id of listingsToSync) {
      try {
        // Check if we're approaching timeout limit
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
        
        // Add a delay between processing listings to avoid overwhelming the API
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
    
    await updateSyncLog(supabase, syncLog.id, {
      status: 'completed',
      end_time: new Date().toISOString(),
      items_count: totalBookingsSynced,
      sync_duration: Date.now() - startTime,
      message: `Successfully synced ${totalBookingsSynced} bookings across ${results.length} listings`,
      bookings_created: created,
      bookings_updated: updated,
      bookings_deleted: deleted
    });
    
    await updateIntegrationHealth(supabase, {
      last_bookings_synced: new Date().toISOString()
    });
    
    // Determine if we need to continue with additional batches
    const moreListingsToProcess = syncAll && results.length < (requestData.totalListings || 0);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalBookingsSynced} bookings`,
        bookingsSynced: totalBookingsSynced,
        listings: results.length,
        created: created,
        updated: updated,
        deleted: deleted,
        results: results,
        moreListingsToProcess: moreListingsToProcess,
        processedCount: results.length,
        executionTime: Date.now() - startTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Booking sync error:', error);
    
    if (syncLog?.id && supabase) {
      await updateSyncLog(supabase, syncLog.id, {
        status: 'error',
        end_time: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
        sync_duration: Date.now() - startTime
      });
    }

    const isRateLimit = error instanceof Error && 
      (error.message?.includes('429') || error.message?.includes('Too Many Requests'));
    
    if (supabase) {
      await updateIntegrationHealth(supabase, {
        status: 'error',
        last_error: error instanceof Error ? error.message : 'Unknown error',
        is_rate_limited: isRateLimit
      });
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during booking sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: isRateLimit ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
