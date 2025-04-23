
import { BookingSyncResult, BookingData } from './types.ts';
import { fetchBookingsFromGuesty } from './api.ts';
import { processBookingBatch, cleanObsoleteBookings } from './db.ts';
import { delay } from '../utils.ts';

export async function syncGuestyBookingsForListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<BookingSyncResult> {
  try {
    console.log(`[GuestySync] Fetching reservations for listing ${listingId}...`);
    
    const { data: response, rateLimitInfo } = await fetchBookingsFromGuesty(token, listingId);
    
    // Store rate limit info
    if (rateLimitInfo) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'reservations',
            rate_limit: rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('[GuestySync] Error storing rate limit info:', error);
      }
    }

    const remoteBookings = (response.results || [])
      .filter((booking: any) => booking.status !== 'cancelled' && booking.status !== 'test')
      .map((booking: any) => {
        const bookingId = booking.id || booking._id;
        const propListingId = booking.listingId || (booking.listing && booking.listing._id) || listingId;
        const guest = booking.guest || {};
        
        if (!bookingId || !propListingId) {
          console.warn("[GuestySync] Missing booking id or listing id, skipping", booking);
          return null;
        }
        
        return {
          id: bookingId,
          listing_id: propListingId,
          guest_name: guest.fullName || guest.name || 'Unknown Guest',
          check_in: booking.startDate || booking.checkIn,
          check_out: booking.endDate || booking.checkOut,
          status: booking.status,
          last_synced: new Date().toISOString(),
          raw_data: booking
        };
      })
      .filter((b: BookingData | null) => b !== null) as BookingData[];

    console.log(`[GuestySync] Got ${remoteBookings.length} bookings from Guesty for listing ${listingId}`);

    // Clean obsolete bookings
    const activeBookingIds = new Set(remoteBookings.map(b => b.id));
    const deleted = await cleanObsoleteBookings(supabase, listingId, activeBookingIds);

    // Process bookings in batches
    const { created, updated } = await processBookingBatch(supabase, remoteBookings);

    console.log(`[GuestySync] [${listingId}] Created: ${created}, Updated: ${updated}, Deleted: ${deleted}`);
    
    return {
      total: remoteBookings.length,
      created,
      updated,
      deleted,
      endpoint: '/v1/reservations'
    };
  } catch (error) {
    console.error(`[GuestySync] Error in syncBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}
