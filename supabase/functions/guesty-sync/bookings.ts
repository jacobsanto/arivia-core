import { GuestyBooking } from './types.ts';
import { generateHousekeepingTasksFromBooking } from './cleaning.ts';

export async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
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
        await generateHousekeepingTasksFromBooking(supabase, bookingForTasks);
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
