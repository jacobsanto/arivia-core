
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GuestyListing {
  _id: string;
  title: string;
  address?: {
    full?: string;
  };
  status?: string;
  propertyType?: string;
  picture?: {
    thumbnail?: string;
  };
}

interface GuestyBooking {
  _id: string;
  guest: {
    fullName: string;
  };
  checkIn: string;
  checkOut: string;
  status: string;
  listing: {
    _id: string;
  };
}

async function getGuestyToken(): Promise<string> {
  const clientId = Deno.env.get('GUESTY_CLIENT_ID');
  const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET');
  
  const response = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Guesty token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function syncGuestyListings(supabase: any, token: string) {
  const response = await fetch('https://open-api.guesty.com/v1/listings', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.statusText}`);
  }

  const data = await response.json();
  const listings = data.results as GuestyListing[];

  for (const listing of listings) {
    await supabase.from('guesty_listings').upsert({
      id: listing._id,
      title: listing.title,
      address: listing.address || {},
      status: listing.status,
      property_type: listing.propertyType,
      thumbnail_url: listing.picture?.thumbnail,
      last_synced: new Date().toISOString(),
      raw_data: listing,
    });
  }

  return listings;
}

async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string) {
  const response = await fetch(`https://open-api.guesty.com/v1/bookings?listingId=${listingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.statusText}`);
  }

  const data = await response.json();
  const bookings = data.results as GuestyBooking[];

  for (const booking of bookings) {
    await supabase.from('guesty_bookings').upsert({
      id: booking._id,
      listing_id: booking.listing._id,
      guest_name: booking.guest.fullName,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      status: booking.status,
      last_synced: new Date().toISOString(),
      raw_data: booking,
    });
  }

  return bookings;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = await getGuestyToken();
    const listings = await syncGuestyListings(supabase, token);

    // Sync bookings for each listing
    const bookingSyncPromises = listings.map(listing => 
      syncGuestyBookingsForListing(supabase, token, listing._id)
    );
    
    await Promise.allSettled(bookingSyncPromises);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sync completed successfully',
      listingsCount: listings.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
