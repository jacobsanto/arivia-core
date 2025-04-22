
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from '../guesty-sync/auth.ts';
import { extractRateLimitInfo, delay } from '../guesty-sync/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let totalBookingsSynced = 0;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const requestData = await req.json();
    const listingId = requestData.listingId;
    const syncAll = requestData.syncAll === true;
    
    // Create sync log entry
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        service: 'guesty',
        sync_type: syncAll ? 'full_bookings_sync' : 'single_listing_bookings',
        status: 'in_progress',
        start_time: new Date().toISOString(),
        message: syncAll 
          ? 'Starting Guesty bookings full sync process' 
          : `Starting sync for listing ${listingId}`
      })
      .select()
      .single();
    
    // Get token
    const token = await getGuestyToken();
    
    // Determine which listings to sync
    let listingsToSync: string[] = [];
    
    if (syncAll) {
      // Get all active listings
      const { data: listings } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active');
        
      listingsToSync = listings?.map(listing => listing.id) || [];
      console.log(`Found ${listingsToSync.length} active listings to sync bookings for`);
    } else if (listingId) {
      listingsToSync = [listingId];
    } else {
      throw new Error('Either listingId or syncAll must be provided');
    }
    
    // Sync bookings for each listing
    const results = [];
    for (const id of listingsToSync) {
      try {
        const bookingsSynced = await syncBookingsForListing(supabase, token, id);
        totalBookingsSynced += bookingsSynced;
        results.push({ listingId: id, bookingsSynced, success: true });
        
        // Add small delay between listings to avoid rate limits
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
    
    // Update sync log with results
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        items_count: totalBookingsSynced,
        sync_duration: Date.now() - startTime,
        message: `Successfully synced ${totalBookingsSynced} bookings across ${listingsToSync.length} listings`,
        bookings_created: totalBookingsSynced // This is approximate as we don't track created vs updated
      })
      .eq('id', syncLog.id);
    
    // Update integration health table with last successful bookings sync
    await supabase
      .from('integration_health')
      .update({
        last_bookings_synced: new Date().toISOString()
      })
      .eq('provider', 'guesty');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalBookingsSynced} bookings`,
        bookingsSynced: totalBookingsSynced,
        listings: listingsToSync.length,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Booking sync error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during booking sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: error.message?.includes('429') ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function syncBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
    
    // Get current date for filtering past bookings
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch bookings from Guesty API
    const response = await fetch(
      `https://open-api.guesty.com/v1/bookings?listingId=${listingId}&checkOut[gte]=${today}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    // Extract and store rate limit information
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'bookings',
            rate_limit: rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error storing rate limit info:', error);
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.statusText}`);
    }

    const data = await response.json();
    const bookings = data.results || [];

    console.log(`Found ${bookings.length} bookings for listing ${listingId}`);

    // Clean up obsolete bookings
    await cleanObsoleteBookings(supabase, listingId, bookings);

    // Create a Set of active booking IDs from Guesty
    const activeBookingIds = new Set(bookings.map(b => b._id));

    // Mark local bookings not found in Guesty as cancelled
    const { data: localBookings } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');

    if (localBookings) {
      const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
      
      if (bookingsToCancel.length > 0) {
        await supabase
          .from('guesty_bookings')
          .update({
            status: 'cancelled',
            last_synced: new Date().toISOString()
          })
          .in('id', bookingsToCancel.map(b => b.id));
        
        console.log(`Marked ${bookingsToCancel.length} bookings as cancelled for listing ${listingId}`);
      }
    }

    // Upsert active bookings
    let created = 0;
    let updated = 0;

    for (const booking of bookings) {
      const bookingData = {
        id: booking._id,
        listing_id: booking.listing._id,
        guest_name: booking.guest?.fullName || 'Guest',
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        status: booking.status,
        last_synced: new Date().toISOString(),
        raw_data: booking
      };

      const { data: existingBooking } = await supabase
        .from('guesty_bookings')
        .select('id')
        .eq('id', booking._id)
        .maybeSingle();

      if (!existingBooking) {
        await supabase
          .from('guesty_bookings')
          .insert(bookingData);
        created++;
      } else {
        await supabase
          .from('guesty_bookings')
          .update(bookingData)
          .eq('id', booking._id);
        updated++;
      }

      // Add small delay between operations to avoid rate limiting
      await delay(100);
    }

    console.log(`Sync completed for listing ${listingId}: ${created} created, ${updated} updated`);
    return bookings.length;

  } catch (error) {
    console.error(`Error in syncBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

async function cleanObsoleteBookings(supabase: any, listingId: string, activeBookings: any[]) {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Create a Set of active booking IDs from Guesty
    const activeBookingIds = new Set(activeBookings.map(b => b._id));

    // Find local bookings for this listing that are not in Guesty's active set
    const { data: localBookings } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');

    if (localBookings) {
      const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
      
      if (bookingsToCancel.length > 0) {
        console.log(`Marking ${bookingsToCancel.length} bookings as cancelled for listing ${listingId}`);
        await supabase
          .from('guesty_bookings')
          .update({
            status: 'cancelled',
            last_synced: new Date().toISOString()
          })
          .in('id', bookingsToCancel.map(b => b.id));
      }
    }
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    throw error;
  }
}
