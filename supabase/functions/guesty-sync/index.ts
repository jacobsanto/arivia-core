
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

// Helper function to get cleaning checklist based on type
function getCleaningChecklist(cleaningType: string) {
  switch (cleaningType.toLowerCase()) {
    case 'full':
      return [
        { id: 1, title: "Deep clean bathroom", completed: false },
        { id: 2, title: "Clean behind furniture", completed: false },
        { id: 3, title: "Change all linens", completed: false },
        { id: 4, title: "Vacuum and mop floors", completed: false },
        { id: 5, title: "Dust all surfaces", completed: false },
        { id: 6, title: "Clean windows", completed: false },
        { id: 7, title: "Sanitize kitchen", completed: false }
      ];
    case 'linen & towel change':
      return [
        { id: 1, title: "Change bed linens", completed: false },
        { id: 2, title: "Replace bath towels", completed: false },
        { id: 3, title: "Replace kitchen towels", completed: false },
        { id: 4, title: "Quick bathroom cleanup", completed: false }
      ];
    default: // Standard
      return [
        { id: 1, title: "Clean bathroom", completed: false },
        { id: 2, title: "Make bed with fresh linens", completed: false },
        { id: 3, title: "Vacuum floors", completed: false },
        { id: 4, title: "Clean kitchen area", completed: false },
        { id: 5, title: "Empty trash", completed: false }
      ];
  }
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

      // Calculate stay duration for cleaning schedule
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate cleaning tasks according to stay duration
      const cleaningTasks = [];
      
      // Always add check-in cleaning (pre-arrival)
      cleaningTasks.push({
        booking_id: booking._id,
        listing_id: booking.listing._id,
        task_type: 'check-in clean',
        title: 'Pre-Arrival Cleaning',
        property_id: booking.listing._id,
        due_date: booking.checkIn,
        status: 'pending',
        priority: 'high',
        cleaning_type: 'Full',
        checklist: JSON.stringify(getCleaningChecklist('full')),
        stay_duration: stayDuration
      });
      
      // For stays between 3-5 nights
      if (stayDuration > 3 && stayDuration <= 5) {
        // Add one full cleaning during stay
        const midStayDate = new Date(checkIn);
        midStayDate.setDate(midStayDate.getDate() + 2); // Around 2 days after check-in
        
        cleaningTasks.push({
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'mid-stay clean',
          title: 'Mid-Stay Full Cleaning',
          property_id: booking.listing._id,
          due_date: midStayDate.toISOString().split('T')[0],
          status: 'pending',
          priority: 'normal',
          cleaning_type: 'Full',
          checklist: JSON.stringify(getCleaningChecklist('full')),
          stay_duration: stayDuration
        });
      } 
      // For stays between 5-7 nights
      else if (stayDuration > 5 && stayDuration <= 7) {
        // Add two full cleanings during stay
        const firstCleaningDate = new Date(checkIn);
        firstCleaningDate.setDate(firstCleaningDate.getDate() + 2); // 2 days after check-in
        
        const secondCleaningDate = new Date(checkIn);
        secondCleaningDate.setDate(secondCleaningDate.getDate() + 5); // 5 days after check-in
        
        cleaningTasks.push({
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'mid-stay clean',
          title: 'First Mid-Stay Cleaning',
          property_id: booking.listing._id,
          due_date: firstCleaningDate.toISOString().split('T')[0],
          status: 'pending',
          priority: 'normal',
          cleaning_type: 'Full',
          checklist: JSON.stringify(getCleaningChecklist('full')),
          stay_duration: stayDuration
        });
        
        cleaningTasks.push({
          booking_id: booking._id,
          listing_id: booking.listing._id,
          task_type: 'mid-stay clean',
          title: 'Second Mid-Stay Cleaning',
          property_id: booking.listing._id,
          due_date: secondCleaningDate.toISOString().split('T')[0],
          status: 'pending',
          priority: 'normal',
          cleaning_type: 'Linen & Towel Change',
          checklist: JSON.stringify(getCleaningChecklist('linen & towel change')),
          stay_duration: stayDuration
        });
      }
      // For stays longer than 7 nights
      else if (stayDuration > 7) {
        // Calculate number of cleanings (approximately every 3 days)
        const numCleanings = Math.floor(stayDuration / 3) - 1; // -1 because we already have check-in/out
        
        for (let i = 0; i < numCleanings; i++) {
          const cleaningDate = new Date(checkIn);
          cleaningDate.setDate(cleaningDate.getDate() + ((i + 1) * 3)); // Every 3 days
          
          // Alternate between full cleaning and linen change
          const cleaningType = i % 2 === 0 ? 'Full' : 'Linen & Towel Change';
          const checklistType = i % 2 === 0 ? 'full' : 'linen & towel change';
          
          cleaningTasks.push({
            booking_id: booking._id,
            listing_id: booking.listing._id,
            task_type: 'mid-stay clean',
            title: `Mid-Stay Cleaning ${i + 1}`,
            property_id: booking.listing._id,
            due_date: cleaningDate.toISOString().split('T')[0],
            status: 'pending',
            priority: 'normal',
            cleaning_type: cleaningType,
            checklist: JSON.stringify(getCleaningChecklist(checklistType)),
            stay_duration: stayDuration
          });
        }
      }
      
      // Always add check-out cleaning
      cleaningTasks.push({
        booking_id: booking._id,
        listing_id: booking.listing._id,
        task_type: 'check-out clean',
        title: 'Post-Departure Cleaning',
        property_id: booking.listing._id,
        due_date: booking.checkOut,
        status: 'pending',
        priority: 'high',
        cleaning_type: 'Full',
        checklist: JSON.stringify(getCleaningChecklist('full')),
        stay_duration: stayDuration
      });

      // Insert all generated cleaning tasks
      for (const task of cleaningTasks) {
        const { error: taskError } = await supabase
          .from('housekeeping_tasks')
          .upsert(task, {
            onConflict: 'booking_id,task_type,due_date'
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
