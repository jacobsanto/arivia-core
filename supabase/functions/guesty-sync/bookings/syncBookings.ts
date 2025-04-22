
import { extractRateLimitInfo, delay } from '../utils.ts';
import { GuestyBooking } from '../types.ts';
import { cleanObsoleteBookings } from './cleanObsoleteBookings.ts';

// Normalization helper for status values
function normalizeStatus(status: string | undefined): string {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (['cancelled', 'canceled'].includes(s)) return 'cancelled';
  if (['pending', 'awaiting'].includes(s)) return 'pending';
  if (['booked', 'confirmed', 'complete'].includes(s)) return 'confirmed';
  return s;
}

/**
 * Syncs Guesty reservations into Supabase for a specific listing.
 * Uses updated endpoint: /v1/reservations?listingId={listingId}
 */
export async function syncGuestyBookingsForListing(supabase: any, token: string, listingId: string): Promise<number> {
  try {
    console.log(`[GuestySync] Fetching reservations for listing ${listingId}...`);
    const today = new Date().toISOString().split('T')[0];
    const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Log rate limit info if present
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'reservations',
            limit: rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('[GuestySync] Error storing rate limit info:', error);
      }
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[GuestySync] Failed to fetch reservations for listing ${listingId}: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const reservations: any[] = data?.results || [];
    console.log(`[GuestySync] [${listingId}] ${reservations.length} reservations fetched from Guesty API`);

    if (!Array.isArray(reservations) || reservations.length === 0) {
      await cleanObsoleteBookings(supabase, listingId, []);
      return 0;
    }

    // Clean obsolete reservations ("bookings") in Supabase
    await cleanObsoleteBookings(supabase, listingId, reservations);

    let created = 0;
    let updated = 0;
    for (const reservation of reservations) {
      try {
        // These are the key fields to sync:
        // id, listingId, guest.fullName/email, startDate, endDate, status
        const bookingId = reservation.id || reservation._id;
        const propListingId = reservation.listingId || (reservation.listing && reservation.listing._id) || listingId;

        if (!bookingId || !propListingId) continue;

        const guest = reservation.guest || {};
        const checkIn = reservation.startDate || reservation.checkIn;
        const checkOut = reservation.endDate || reservation.checkOut;
        const bookingStatus = normalizeStatus(reservation.status);

        const bookingData = {
          id: bookingId,
          listing_id: propListingId,
          guest_name: guest.fullName || guest.name || 'Unknown Guest',
          check_in: checkIn,
          check_out: checkOut,
          status: bookingStatus,
          last_synced: new Date().toISOString(),
          raw_data: reservation // Store original for possible notes, financial, etc.
        };

        // Upsert booking into guesty_bookings
        const { data: existingBooking, error: lookupError } = await supabase
          .from('guesty_bookings')
          .select('id')
          .eq('id', bookingId)
          .maybeSingle();

        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);
          if (!insertError) created++;
          else console.error(`[GuestySync] Failed to insert booking ${bookingId}:`, insertError);
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', bookingId);
          if (!updateError) updated++;
          else console.error(`[GuestySync] Failed to update booking ${bookingId}:`, updateError);
        }

        await delay(50); // brief rate limit friendly delay
      } catch (err) {
        console.error(`[GuestySync] Error processing reservation ${reservation.id || reservation._id || 'unknown'}:`, err);
      }
    }

    console.log(`[GuestySync] [${listingId}] Reservations upserted: created=${created}, updated=${updated}`);
    return reservations.length;
  } catch (error) {
    console.error(`[GuestySync] Error in syncGuestyBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}
