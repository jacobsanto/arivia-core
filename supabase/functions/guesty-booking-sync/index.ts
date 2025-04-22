import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getGuestyToken } from './auth.ts';
import { extractRateLimitInfo, delay } from './utils.ts';

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
    
    const requestData = await req.json();
    const listingId = requestData.listingId;
    const syncAll = requestData.syncAll === true;
    
    console.log(`Starting Guesty bookings sync: ${syncAll ? 'Full sync' : `Single listing: ${listingId}`}`);
    
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
    
    const token = await getGuestyToken();
    
    let listingsToSync: string[] = [];
    
    if (syncAll) {
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
    
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        items_count: totalBookingsSynced,
        sync_duration: Date.now() - startTime,
        message: `Successfully synced ${totalBookingsSynced} bookings across ${listingsToSync.length} listings`,
        bookings_created: created,
        bookings_updated: updated,
        bookings_deleted: deleted
      })
      .eq('id', syncLog.id);
    
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
        created: created,
        updated: updated,
        deleted: deleted,
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
        status: error instanceof Error && error.message?.includes('429') ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function syncBookingsForListing(supabase: any, token: string, listingId: string): Promise<{
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
    
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Attempting to fetch bookings using /v1/bookings endpoint...');
    let response = await fetch(
      `https://open-api.guesty.com/v1/bookings?listingId=${listingId}&checkOut[gte]=${today}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    let data;
    let endpoint = 'v1/bookings';

    if (!response.ok || (response.ok && (await response.json()).results?.length === 0)) {
      console.log('First attempt failed or returned no bookings, trying alternative endpoint...');
      
      await delay(1000);
      
      response = await fetch(
        `https://open-api.guesty.com/v1/listings/${listingId}/bookings?checkOut[gte]=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      endpoint = 'v1/listings/bookings';
    }

    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: endpoint,
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
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.status} ${response.statusText}`);
    }

    data = await response.json();
    
    if (!data || !Array.isArray(data.results)) {
      console.error('Invalid response format from Guesty API:', data);
      throw new Error('Invalid response format from Guesty API');
    }
    
    const bookings = data.results || [];

    console.log(`Found ${bookings.length} bookings for listing ${listingId} using ${endpoint}`);

    await supabase
      .from('integration_health')
      .update({
        last_successful_endpoint: endpoint,
        endpoint_stats: {
          endpoint,
          success_count: 1,
          last_success: new Date().toISOString()
        }
      })
      .eq('provider', 'guesty');

    const deleted = await cleanObsoleteBookings(supabase, listingId, bookings);

    let created = 0;
    let updated = 0;

    for (const booking of bookings) {
      if (!booking._id || !booking.listing || !booking.listing._id) {
        console.error('Invalid booking data received:', booking);
        continue;
      }
      
      const guestName = booking.guest?.fullName || 'Guest';
      
      const bookingData = {
        id: booking._id,
        listing_id: booking.listing._id,
        guest_name: guestName,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        status: booking.status,
        last_synced: new Date().toISOString(),
        raw_data: booking
      };

      try {
        const { data: existingBooking, error: selectError } = await supabase
          .from('guesty_bookings')
          .select('id')
          .eq('id', booking._id)
          .maybeSingle();

        if (selectError) {
          console.error(`Error checking for existing booking ${booking._id}:`, selectError);
          continue;
        }

        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);
          
          if (insertError) {
            console.error(`Error inserting booking ${booking._id}:`, insertError);
            continue;
          }
          created++;
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', booking._id);
          
          if (updateError) {
            console.error(`Error updating booking ${booking._id}:`, updateError);
            continue;
          }
          updated++;
        }
      } catch (error) {
        console.error(`Error processing booking ${booking._id}:`, error);
      }

      await delay(100);
    }

    console.log(`Sync completed for listing ${listingId}: ${created} created, ${updated} updated, ${deleted} deleted/cancelled`);
    return { 
      total: bookings.length,
      created, 
      updated, 
      deleted,
      endpoint
    };

  } catch (error) {
    console.error(`Error in syncBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

async function cleanObsoleteBookings(supabase: any, listingId: string, activeBookings: any[]): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeBookingIds = new Set(activeBookings.map(b => b._id));

    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
      
    if (error) {
      console.error(`Error fetching local bookings for listing ${listingId}:`, error);
      return 0;
    }

    if (!localBookings || localBookings.length === 0) {
      return 0;
    }
    
    const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
    
    if (bookingsToCancel.length === 0) {
      return 0;
    }
    
    console.log(`Marking ${bookingsToCancel.length} bookings as cancelled for listing ${listingId}`);
    
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', bookingsToCancel.map(b => b.id));
    
    if (updateError) {
      console.error(`Error cancelling obsolete bookings for listing ${listingId}:`, updateError);
      return 0;
    }
    
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    return 0;
  }
}
