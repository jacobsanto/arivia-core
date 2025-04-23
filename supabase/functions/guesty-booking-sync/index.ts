
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { SyncResponse, GuestyBooking } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GUESTY_CLIENT_ID = Deno.env.get('GUESTY_CLIENT_ID')!;
const GUESTY_CLIENT_SECRET = Deno.env.get('GUESTY_CLIENT_SECRET')!;

// Constants
const MAX_RUNTIME_MS = 50000; // 50 seconds
const MAX_RETRIES = 3;
const DELAY_BETWEEN_LISTINGS_MS = 300;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGuestyToken(): Promise<string> {
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
}

async function fetchGuestyBookings(token: string, listingId: string): Promise<GuestyBooking[]> {
  const bookings: GuestyBooking[] = [];
  let page = 1;
  const today = new Date().toISOString().split('T')[0];

  while (true) {
    const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}&page=${page}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    
    for (const booking of results) {
      const totalGuests = 
        (booking.guests?.adults || 0) + 
        (booking.guests?.children || 0) + 
        (booking.guests?.infants || 0);

      bookings.push({
        id: booking._id || booking.id,
        listing_id: listingId,
        guest_name: booking.guest?.fullName || null,
        guest_email: booking.guest?.email || null,
        amount_paid: booking.price?.totalPrice || 0,
        currency: booking.price?.currency || 'EUR',
        status: booking.status,
        total_guests: totalGuests,
        check_in: booking.startDate || booking.checkIn,
        check_out: booking.endDate || booking.checkOut,
        raw_data: booking,
        last_synced: new Date().toISOString()
      });
    }

    // If we got less results than the page size, we're done
    if (results.length < 20) break;
    page++;
  }

  return bookings;
}

async function syncListingWithRetry(
  supabase: any,
  token: string,
  listingId: string,
  retryCount = 0
): Promise<number> {
  try {
    const bookings = await fetchGuestyBookings(token, listingId);
    
    // Upsert bookings in batches
    const chunkSize = 20;
    for (let i = 0; i < bookings.length; i += chunkSize) {
      const chunk = bookings.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('guesty_bookings')
        .upsert(chunk, {
          onConflict: 'id'
        });

      if (error) throw error;
    }

    return bookings.length;
  } catch (error) {
    console.error(`Error syncing listing ${listingId}:`, error);
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return syncListingWithRetry(supabase, token, listingId, retryCount + 1);
    }
    throw error;
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
  let processedListings = 0;

  try {
    // Get Guesty access token
    const token = await getGuestyToken();

    // Fetch all active listings
    const { data: listings, error } = await supabase
      .from('guesty_listings')
      .select('id')
      .eq('is_deleted', false)
      .eq('sync_status', 'active');

    if (error) throw error;

    // Process each listing
    for (const listing of listings) {
      // Check if we're approaching the runtime limit
      if (Date.now() - startTime > MAX_RUNTIME_MS) {
        console.log('Approaching max runtime, stopping');
        break;
      }

      try {
        const bookingsCount = await syncListingWithRetry(supabase, token, listing.id);
        totalBookings += bookingsCount;
        processedListings++;
        
        // Add a delay between listings
        if (processedListings < listings.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_LISTINGS_MS));
        }
      } catch (error) {
        console.error(`Failed to sync listing ${listing.id}:`, error);
        failedListings.push(listing.id);
      }
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const response: SyncResponse = {
      success: true,
      listings_processed: processedListings,
      total_bookings: totalBookings,
      time_taken: formattedTime,
      failed_listings: failedListings
    };

    return new Response(JSON.stringify(response), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        listings_processed: processedListings,
        total_bookings: totalBookings,
        failed_listings: failedListings
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
