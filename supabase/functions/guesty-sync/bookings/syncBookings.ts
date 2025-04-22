
import { extractRateLimitInfo, delay } from '../utils.ts';
import { GuestyBooking } from '../types.ts';
import { cleanObsoleteBookings } from './cleanObsoleteBookings.ts';

// Main booking sync logic, extracted for maintainability
export async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://open-api.guesty.com/v1/bookings?listingId=${listingId}&checkOut[gte]=${today}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
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
      throw new Error(`Invalid booking response format for listing ${listingId}`);
    }
    const bookings = data.results as GuestyBooking[];
    if (bookings.length === 0) {
      await cleanObsoleteBookings(supabase, listingId, []);
      return 0;
    }
    await cleanObsoleteBookings(supabase, listingId, bookings);
    let created = 0;
    let updated = 0;
    for (const booking of bookings) {
      try {
        if (!booking._id || !booking.listing || !booking.listing._id) continue;
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
        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);
          if (!insertError) created++;
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', booking._id);
          if (!updateError) updated++;
        }
        await delay(50);
      } catch (err) {
        console.error(`Error processing booking ${booking._id || 'unknown'}:`, err);
      }
    }
    return bookings.length;
  } catch (error) {
    console.error(`Error in syncGuestyBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}
