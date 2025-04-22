
import { extractRateLimitInfo, delay } from './utils.ts';
import { GuestyBooking } from './types.ts';

export async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
    
    // Get current date for filtering past bookings
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch bookings from Guesty API
    console.log(`Fetching bookings for listing ${listingId} with checkOut >= ${today}`);
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
      console.log(`Booking API rate limit for listing ${listingId}: ${rateLimitInfo.remaining}/${rateLimitInfo.rate_limit}`);
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'bookings',
            limit: rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error storing rate limit info:', error);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      console.error(`Invalid booking response format for listing ${listingId}:`, data);
      throw new Error(`Invalid booking response format for listing ${listingId}`);
    }

    const bookings = data.results as GuestyBooking[];
    console.log(`Found ${bookings.length} bookings for listing ${listingId}`);

    if (bookings.length === 0) {
      // Even with no bookings, we should clean up obsolete ones
      await cleanObsoleteBookings(supabase, listingId, []);
      return 0;
    }

    // Clean up obsolete bookings
    await cleanObsoleteBookings(supabase, listingId, bookings);

    // Upsert active bookings
    let created = 0;
    let updated = 0;

    for (const booking of bookings) {
      try {
        if (!booking._id || !booking.listing || !booking.listing._id) {
          console.error(`Invalid booking data, missing ID or listing ID:`, booking);
          continue;
        }

        const bookingData = {
          id: booking._id,
          listing_id: booking.listing._id,
          guest_name: booking.guest?.fullName || 'Unknown Guest',
          check_in: booking.checkIn,
          check_out: booking.checkOut,
          status: booking.status || 'unknown',
          last_synced: new Date().toISOString(),
          raw_data: booking
        };

        const { data: existingBooking, error: lookupError } = await supabase
          .from('guesty_bookings')
          .select('id')
          .eq('id', booking._id)
          .maybeSingle();

        if (lookupError) {
          console.error(`Error looking up booking ${booking._id}:`, lookupError);
        }

        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);
          
          if (insertError) {
            console.error(`Error inserting booking ${booking._id}:`, insertError);
          } else {
            created++;
          }
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', booking._id);
          
          if (updateError) {
            console.error(`Error updating booking ${booking._id}:`, updateError);
          } else {
            updated++;
          }
        }

        // Add small delay between operations to avoid rate limiting
        await delay(50);
      } catch (err) {
        console.error(`Error processing booking ${booking._id || 'unknown'}:`, err);
        // Continue with next booking
      }
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
    console.log(`Active booking IDs for listing ${listingId}:`, Array.from(activeBookingIds));

    // Find local bookings for this listing that are not in Guesty's active set
    const { data: localBookings, error: queryError } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');

    if (queryError) {
      console.error(`Error querying local bookings for listing ${listingId}:`, queryError);
      return;
    }

    if (localBookings && localBookings.length > 0) {
      const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
      
      if (bookingsToCancel.length > 0) {
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
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    throw error;
  }
}
