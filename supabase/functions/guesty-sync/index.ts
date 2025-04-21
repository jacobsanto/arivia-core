
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { syncGuestyListings } from './listings.ts';
import { syncGuestyBookingsForListing } from './bookings.ts';

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

    console.log('Checking last sync time...');

    // Check for recent syncs
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

    if (recentSync && recentSync.length > 0) {
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

    // Create new sync log entry with new columns
    const { data: newSyncLog } = await supabase
      .from('sync_logs')
      .insert({
        service: 'guesty',
        sync_type: 'full_sync',
        status: 'in_progress',
        start_time: new Date().toISOString(),
        message: 'Starting Guesty full sync process'
      })
      .select()
      .single();

    syncLog = newSyncLog;

    console.log('Starting Guesty sync process...');

    // Get token using the caching logic
    const token = await getGuestyToken();
    
    // Sync listings
    const listings = await syncGuestyListings(supabase, token);

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

    // Update sync log with results using new columns
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        items_count: listings.length + totalBookingsSynced,
        sync_duration: Date.now() - startTime,
        message: `Successfully synced ${listings.length} listings and ${totalBookingsSynced} bookings`,
        sync_type: 'full_sync'
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
        updated_at: new Date().toISOString()
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

    // Update sync log with error details
    if (syncLog?.id) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'error',
          end_time: new Date().toISOString(),
          message: error.message,
          sync_type: 'full_sync',
          sync_duration: Date.now() - startTime
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
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'provider'
      });

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
