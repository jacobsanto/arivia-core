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

      // Create a booking object in the format expected by generateHousekeepingTasksFromBooking
      const bookingForTasks = {
        id: booking._id,
        property_id: booking.listing._id,
        listing_id: booking.listing._id,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        guest_name: booking.guest.fullName,
      };

      // Calculate stay duration for cleaning schedule
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      try {
        await generateHousekeepingTasksFromBooking(bookingForTasks);
      } catch (taskError) {
        console.error(`Error generating housekeeping tasks for booking ${booking._id}:`, taskError);
      }
    });

    await Promise.allSettled(upsertPromises);

    return bookings.length;
  } catch (error) {
    console.error(`Error in syncGuestyBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

/**
 * Interface for booking objects
 */
interface BookingObject {
  id: string;
  property_id: string;
  listing_id?: string; // Some bookings may have listing_id instead of property_id
  check_in_date: string | Date;
  check_out_date: string | Date;
  guest_name: string;
  [key: string]: any; // Allow for other properties
}

/**
 * Interface for the task generation result
 */
interface TaskGenerationResult {
  tasksCreated: {
    id: string;
    task_type: string;
    due_date: string;
  }[];
  tasksSkipped: {
    task_type: string;
    due_date: string;
    reason: string;
  }[];
  manual_schedule_required: boolean;
}

/**
 * Generates housekeeping tasks for a given booking based on stay duration
 * @param booking The booking object containing check-in/out dates and property info
 * @returns Object containing created tasks, skipped tasks, and if manual scheduling is required
 */
async function generateHousekeepingTasksFromBooking(booking: BookingObject): Promise<TaskGenerationResult> {
  try {
    // Initialize result
    const result: TaskGenerationResult = {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };

    // Normalize dates to Date objects
    const checkIn = typeof booking.check_in_date === 'string' 
      ? new Date(booking.check_in_date) 
      : booking.check_in_date;
    
    const checkOut = typeof booking.check_out_date === 'string' 
      ? new Date(booking.check_out_date) 
      : booking.check_out_date;

    // Calculate stay duration in nights
    const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use listing_id if available, otherwise use property_id
    const listingId = booking.listing_id || booking.property_id;
    
    // Check for same-day check-in after this booking's check-out
    const { data: sameDayBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', booking.property_id)
      .eq('check_in_date', checkOut.toISOString().split('T')[0])
      .neq('id', booking.id);
    
    const hasSameDayCheckIn = sameDayBookings && sameDayBookings.length > 0;
    
    // Generate the tasks based on stay duration
    const tasks = [];
    
    // 1. Pre-arrival Standard Cleaning (for all stays)
    const preArrivalDate = new Date(checkIn);
    preArrivalDate.setDate(preArrivalDate.getDate() - 1);
    const preArrivalDateStr = preArrivalDate.toISOString().split('T')[0];
    
    tasks.push({
      booking_id: booking.id,
      listing_id: listingId,
      task_type: "Standard Cleaning",
      due_date: preArrivalDateStr,
      status: "pending",
      description: `Pre-arrival cleaning for ${booking.guest_name}`
    });
    
    // 2. Determine mid-stay cleanings based on duration
    if (stayDuration <= 3) {
      // No mid-stay cleaning needed
    } 
    else if (stayDuration <= 5) {
      // One mid-stay cleaning
      const midpointDate = new Date(checkIn);
      midpointDate.setDate(midpointDate.getDate() + Math.floor(stayDuration / 2));
      const midpointDateStr = midpointDate.toISOString().split('T')[0];
      
      // Add Full Cleaning
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: midpointDateStr,
        status: "pending",
        description: `Mid-stay full cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Change on same day
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: midpointDateStr,
        status: "pending",
        description: `Mid-stay linen & towel change for ${booking.guest_name}`
      });
    } 
    else if (stayDuration <= 7) {
      // Two mid-stay cleanings at 1/3 and 2/3 of stay
      const firstThirdDate = new Date(checkIn);
      firstThirdDate.setDate(firstThirdDate.getDate() + Math.floor(stayDuration / 3));
      const firstThirdDateStr = firstThirdDate.toISOString().split('T')[0];
      
      const secondThirdDate = new Date(checkIn);
      secondThirdDate.setDate(secondThirdDate.getDate() + Math.floor((stayDuration / 3) * 2));
      const secondThirdDateStr = secondThirdDate.toISOString().split('T')[0];
      
      // Add Full Cleanings
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: firstThirdDateStr,
        status: "pending",
        description: `First mid-stay cleaning for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: secondThirdDateStr,
        status: "pending",
        description: `Second mid-stay cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Changes on same days
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: firstThirdDateStr,
        status: "pending",
        description: `First linen & towel change for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: secondThirdDateStr,
        status: "pending",
        description: `Second linen & towel change for ${booking.guest_name}`
      });
    } 
    else {
      // Stays longer than 7 nights - custom schedule
      const customCleaningDate = new Date(checkIn);
      customCleaningDate.setDate(customCleaningDate.getDate() + 3);
      const customCleaningDateStr = customCleaningDate.toISOString().split('T')[0];
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Custom Cleaning Schedule",
        due_date: customCleaningDateStr,
        status: "pending",
        description: `Custom cleaning schedule for extended stay (${stayDuration} nights) - ${booking.guest_name}`
      });
      
      // Flag for manual schedule
      result.manual_schedule_required = true;
    }
    
    // 3. Post-checkout cleaning (if no same-day check-in)
    if (!hasSameDayCheckIn) {
      const checkoutDateStr = checkOut.toISOString().split('T')[0];
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Standard Cleaning",
        due_date: checkoutDateStr,
        status: "pending",
        description: `Post-checkout cleaning after ${booking.guest_name}`
      });
    } else {
      // Log the skipped task
      result.tasksSkipped.push({
        task_type: "Standard Cleaning",
        due_date: checkOut.toISOString().split('T')[0],
        reason: "Same-day check-in detected"
      });
    }
    
    // Insert tasks into database, avoiding duplicates
    for (const task of tasks) {
      // Check if this task already exists
      const { data: existingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id')
        .eq('booking_id', task.booking_id)
        .eq('task_type', task.task_type)
        .eq('due_date', task.due_date);
      
      if (existingTasks && existingTasks.length > 0) {
        // Task already exists, skip it
        result.tasksSkipped.push({
          task_type: task.task_type,
          due_date: task.due_date,
          reason: "Duplicate task"
        });
      } else {
        // Insert the new task
        const { data: insertedTask, error } = await supabase
          .from('housekeeping_tasks')
          .insert(task)
          .select('id, task_type, due_date')
          .single();
        
        if (error) {
          console.error(`Error creating task: ${error.message}`, task);
          result.tasksSkipped.push({
            task_type: task.task_type,
            due_date: task.due_date,
            reason: `Database error: ${error.message}`
          });
        } else if (insertedTask) {
          result.tasksCreated.push({
            id: insertedTask.id,
            task_type: insertedTask.task_type,
            due_date: insertedTask.due_date
          });
        }
      }
    }
    
    return result;
    
  } catch (error: any) {
    console.error("Error generating housekeeping tasks:", error);
    
    return {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };
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
