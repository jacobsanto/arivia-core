
import { extractRateLimitInfo, delay } from './utils.ts';
import { GuestyBooking } from './types.ts';

export async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
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
            limit: rateLimitInfo.limit,
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
    const bookings = data.results as GuestyBooking[];

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
        guest_name: booking.guest.fullName,
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
    console.error(`Error in syncGuestyBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

async function cleanObsoleteBookings(supabase: any, listingId: string, activeBookings: GuestyBooking[]) {
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
