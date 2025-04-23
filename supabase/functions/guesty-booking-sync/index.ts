
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { createSyncLog, updateSyncLog, updateIntegrationHealth } from './sync-log.ts';
import { handleError } from './error-handlers.ts';
import { processListings } from './listing-processor.ts';
import { createSuccessResponse } from './sync-result-handlers.ts';
import { corsHeaders } from './utils.ts';

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
    const startIndex = requestData.startIndex || 0;
    
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
      const { data: listings, error: listingsError } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active')
        .order('id', { ascending: true })
        .range(startIndex, startIndex + 2);
      
      if (listingsError) {
        throw new Error(`Failed to fetch listings: ${listingsError.message}`);
      }
        
      listingsToSync = listings?.map(listing => listing.id) || [];
    } else if (listingId) {
      listingsToSync = [listingId];
    } else {
      throw new Error('Either listingId or syncAll must be provided');
    }
    
    if (listingsToSync.length === 0) {
      throw new Error('No listings found to sync');
    }
    
    const { results, totalBookingsSynced: total, created, updated, deleted } = 
      await processListings(supabase, token, listingsToSync, startTime, MAX_EXECUTION_TIME);
    
    await updateSyncLog(supabase, syncLog.id, {
      status: 'completed',
      end_time: new Date().toISOString(),
      items_count: total,
      sync_duration: Date.now() - startTime,
      message: `Successfully synced ${total} bookings across ${results.length} listings`,
      bookings_created: created,
      bookings_updated: updated,
      bookings_deleted: deleted
    });
    
    await updateIntegrationHealth(supabase, {
      last_bookings_synced: new Date().toISOString()
    });
    
    return createSuccessResponse(total, results, created, updated, deleted, startTime);
    
  } catch (error) {
    return handleError(error, supabase, syncLog, startTime);
  }
});

