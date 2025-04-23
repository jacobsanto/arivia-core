
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { delay, extractRateLimitInfo } from './utils.ts';
import { BookingSyncResult, BookingData } from './types.ts';

/**
 * Syncs Guesty reservations for a specific listing using optimized approach
 * - Uses the /v1/reservations?listingId={listingId}&endDate[gte]={today} endpoint
 * - Optimized database operations
 * - Better error handling and logging
 */
export async function syncBookingsForListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<BookingSyncResult> {
  try {
    console.log(`[GuestyBookingSync] Syncing bookings for listing ${listingId}...`);

    const today = new Date().toISOString().split('T')[0];
    const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}`;
    const endpoint = '/v1/reservations';

    console.log(`[GuestyBookingSync] Fetching bookings URL: ${url}`);
    
    // Fetch bookings with proper error handling
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Track API usage for rate limiting monitoring
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

    // Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      
      console.error(`[GuestyBookingSync] Failed to fetch bookings: ${status} ${response.statusText}`, errorText);
      
      // Special handling for rate limits
      if (status === 429) {
        throw new Error(`Rate limit exceeded: ${errorText}`);
      }
      
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      console.error('[GuestyBookingSync] Bad result structure:', data);
      throw new Error('Invalid response format from Guesty reservations endpoint');
    }

    // Filter out cancelled and test bookings
    const remoteBookings = (data.results as any[]).filter(booking =>
      booking.status !== 'cancelled' && booking.status !== 'test'
    );

    console.log(`[GuestyBookingSync] Got ${remoteBookings.length} bookings from Guesty for listing ${listingId}`);

    // Clean obsolete bookings (mark as cancelled)
    const deleted = await cleanObsoleteBookings(supabase, listingId, remoteBookings);

    // Process bookings in batches to improve efficiency
    let created = 0;
    let updated = 0;

    // Prepare booking data for batch processing
    const bookingsToProcess = remoteBookings.map(booking => {
      const bookingId = booking.id || booking._id;
      const propListingId = booking.listingId || (booking.listing && booking.listing._id) || listingId;
      const guest = booking.guest || {};
      
      if (!bookingId || !propListingId) {
        console.warn("[GuestyBookingSync] Missing booking id or listing id, skipping", booking);
        return null;
      }
      
      const guestName = guest.fullName || guest.name || 'Unknown Guest';
      const checkIn = booking.startDate || booking.checkIn;
      const checkOut = booking.endDate || booking.checkOut;
      const status = booking.status;

      return {
        id: bookingId,
        listing_id: propListingId,
        guest_name: guestName,
        check_in: checkIn,
        check_out: checkOut,
        status: status,
        last_synced: new Date().toISOString(),
        raw_data: booking
      };
    }).filter(booking => booking !== null) as BookingData[];

    // Process bookings in smaller batches to reduce DB load
    const BATCH_SIZE = 10;
    for (let i = 0; i < bookingsToProcess.length; i += BATCH_SIZE) {
      const batch = bookingsToProcess.slice(i, i + BATCH_SIZE);
      
      // First, check which bookings already exist
      const bookingIds = batch.map(b => b.id);
      const { data: existingBookings, error: selectError } = await supabase
        .from('guesty_bookings')
        .select('id')
        .in('id', bookingIds);

      if (selectError) {
        console.error(`[GuestyBookingSync] Error checking for existing bookings:`, selectError);
        continue;
      }

      const existingIds = new Set((existingBookings || []).map(b => b.id));

      // Split into create and update operations
      const bookingsToCreate = batch.filter(b => !existingIds.has(b.id));
      const bookingsToUpdate = batch.filter(b => existingIds.has(b.id));

      // Insert new bookings
      if (bookingsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('guesty_bookings')
          .insert(bookingsToCreate);

        if (insertError) {
          console.error(`[GuestyBookingSync] Error inserting bookings:`, insertError);
        } else {
          created += bookingsToCreate.length;
        }
      }

      // Update existing bookings
      if (bookingsToUpdate.length > 0) {
        // Bulk update is not supported, so we do them one by one
        for (const booking of bookingsToUpdate) {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(booking)
            .eq('id', booking.id);
  
          if (updateError) {
            console.error(`[GuestyBookingSync] Error updating booking ${booking.id}:`, updateError);
            continue;
          }
          updated++;
        }
      }

      // Short delay between batches to avoid overwhelming the database
      if (i + BATCH_SIZE < bookingsToProcess.length) {
        await delay(100);
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

/**
 * Clean obsolete bookings by marking them as cancelled
 * - Identifies local bookings not present in the remote data
 * - Only affects non-cancelled bookings with future checkout dates
 */
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
