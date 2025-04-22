
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { delay, extractRateLimitInfo } from './utils.ts';

interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

/**
 * Syncs Guesty reservations for a listing using /v1/reservations?listingId=... API
 * Optionally run in "test mode" for one listing via POST param.
 */
export async function syncBookingsForListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<BookingSyncResult> {
  try {
    console.log(`[GuestyBookingSync] Syncing bookings for listing ${listingId}...`);

    const today = new Date().toISOString().split('T')[0];
    // Guesty recommended endpoint for all future/present bookings:
    // /v1/reservations?listingId={listingId}&endDate[gte]={today}
    const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}`;
    let endpoint = '/v1/reservations';

    console.log(`[GuestyBookingSync] Fetching bookings URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Rate limit logging
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint,
            rate_limit: rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('[GuestyBookingSync] Error storing rate limit info:', error);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GuestyBookingSync] Failed to fetch bookings: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      console.error('[GuestyBookingSync] Bad result structure:', data);
      throw new Error('Invalid response format from Guesty reservations endpoint');
    }

    const remoteBookings = (data.results as any[]).filter(booking =>
      booking.status !== 'cancelled' && booking.status !== 'test'
    );

    console.log(`[GuestyBookingSync] Got ${remoteBookings.length} bookings from Guesty for listing ${listingId}`);

    // Clean obsolete bookings
    const deleted = await cleanObsoleteBookings(supabase, listingId, remoteBookings);

    let created = 0;
    let updated = 0;

    // Write each booking to DB (upsert)
    for (const booking of remoteBookings) {
      try {
        // Defensive checks
        const bookingId = booking.id || booking._id;
        const propListingId = booking.listingId || (booking.listing && booking.listing._id) || listingId;
        const guest = booking.guest || {};

        if (!bookingId || !propListingId) {
          console.warn("[GuestyBookingSync] Missing booking id or listing id, skipping", booking);
          continue;
        }
        const guestName = guest.fullName || guest.name || 'Unknown Guest';
        const checkIn = booking.startDate || booking.checkIn;
        const checkOut = booking.endDate || booking.checkOut;
        const status = booking.status;

        const bookingData = {
          id: bookingId,
          listing_id: propListingId,
          guest_name: guestName,
          check_in: checkIn,
          check_out: checkOut,
          status: status,
          last_synced: new Date().toISOString(),
          raw_data: booking
        };

        // Upsert logic
        const { data: existingBooking, error: selectError } = await supabase
          .from('guesty_bookings')
          .select('id')
          .eq('id', bookingId)
          .maybeSingle();

        if (selectError) {
          console.error(`[GuestyBookingSync] Error checking for existing booking ${bookingId}:`, selectError);
          continue;
        }

        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);

          if (insertError) {
            console.error(`[GuestyBookingSync] Error inserting booking ${bookingId}:`, insertError);
            continue;
          }
          created++;
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', bookingId);

          if (updateError) {
            console.error(`[GuestyBookingSync] Error updating booking ${bookingId}:`, updateError);
            continue;
          }
          updated++;
        }

        await delay(75); // gentle throttle
      } catch (err) {
        console.error('[GuestyBookingSync] Error processing booking:', err);
      }
    }

    console.log(`[GuestyBookingSync] [${listingId}] Created: ${created}, Updated: ${updated}, Deleted: ${deleted}`);
    return {
      total: remoteBookings.length,
      created,
      updated,
      deleted,
      endpoint,
    };
  } catch (error) {
    console.error(`[GuestyBookingSync] Error in syncBookingsForListing for listing ${listingId}:`, error);
    throw error;
  }
}

// Updated: Compare by both .id and ._id for max compatibility
async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  activeBookings: any[]
): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeIds = new Set(activeBookings.map(b => b.id || b._id));
    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
    if (error) {
      console.error(`[GuestyBookingSync] Error querying local bookings for obsolete cleanup for listing ${listingId}:`, error);
      return 0;
    }
    if (!localBookings || localBookings.length === 0) return 0;
    const bookingsToCancel = localBookings.filter(b => !activeIds.has(b.id));
    if (bookingsToCancel.length === 0) return 0;

    console.log(`[GuestyBookingSync] Marking ${bookingsToCancel.length} bookings as cancelled (obsolete)`);
    const { error: updateError } = await supabase
      .from('guesty_bookings')
      .update({
        status: 'cancelled',
        last_synced: new Date().toISOString()
      })
      .in('id', bookingsToCancel.map(b => b.id));
    if (updateError) {
      console.error(`[GuestyBookingSync] Error cancelling obsolete bookings:`, updateError);
      return 0;
    }
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`[GuestyBookingSync] Error in cleanObsoleteBookings:`, error);
    return 0;
  }
}
