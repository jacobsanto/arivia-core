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
  try {
    console.log('Starting Guesty listings sync...');
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

    console.log(`Syncing ${listings.length} listings...`);

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
  } catch (error) {
    console.error('Error in syncGuestyListings:', error);
    throw error;
  }
}

async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
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

    console.log(`Found ${bookings.length} bookings for listing ${listingId}`);

    const upsertPromises = bookings.map(async (booking) => {
      const { error: bookingError } = await supabase.from('guesty_bookings').upsert({
        id: booking._id,
        listing_id: booking.listing._id,
        guest_name: booking.guest.fullName,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        status: booking.status,
        last_synced: new Date().toISOString(),
        raw_data: booking,
      });

      if (bookingError) {
        console.error(`Error upserting booking ${booking._id}:`, bookingError);
        return;
      }

      const tasks = [
        {
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'check-in clean',
          due_date: booking.checkIn,
          status: 'pending'
        },
        {
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'check-out clean',
          due_date: booking.checkOut,
          status: 'pending'
        }
      ];

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (stayDuration > 7) {
        const midStayDate = new Date(checkIn);
        midStayDate.setDate(midStayDate.getDate() + Math.floor(stayDuration / 2));
        
        tasks.push({
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'mid-stay clean',
          due_date: midStayDate.toISOString().split('T')[0],
          status: 'pending'
        });
      }

      for (const task of tasks) {
        const { error: taskError } = await supabase
          .from('housekeeping_tasks')
          .upsert(task, {
            onConflict: 'booking_id,task_type'
          });

        if (taskError) {
          console.error(`Error creating housekeeping task for booking ${booking._id}:`, taskError);
        }
      }
    });

    await Promise.allSettled(upsertPromises);

    return bookings.length;
  } catch (error) {
    console.error(`Error in syncGuestyBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Guesty sync process...');

    const token = await getGuestyToken();
    const listings = await syncGuestyListings(supabase, token);

    console.log(`Syncing bookings for ${listings.length} listings...`);
    const bookingSyncPromises = listings.map(listing => 
      syncGuestyBookingsForListing(supabase, token, listing._id)
    );
    
    const bookingResults = await Promise.allSettled(bookingSyncPromises);

    const totalBookingsSynced = bookingResults
      .filter(result => result.status === 'fulfilled')
      .reduce((total, result) => total + (result as PromiseFulfilledResult<number>).value, 0);

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
