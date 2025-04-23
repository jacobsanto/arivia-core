
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { BookingSyncResult } from './types.ts';
import { extractRateLimitInfo } from './utils.ts';
import { processBookings } from './process-bookings.ts';
import { cleanObsoleteBookings } from './clean-obsolete.ts';
import { prepareBookings } from './prepare-bookings.ts';

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

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      
      if (status === 429) {
        throw new Error(`Rate limit exceeded: ${errorText}`);
      }
      
      throw new Error(`Failed to fetch bookings for listing ${listingId}: ${status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from Guesty reservations endpoint');
    }

    const remoteBookings = data.results.filter(booking =>
      booking.status !== 'cancelled' && booking.status !== 'test'
    );

    const deleted = await cleanObsoleteBookings(supabase, listingId, remoteBookings);
    const bookingsToProcess = prepareBookings(remoteBookings);
    const { created, updated } = await processBookings(supabase, bookingsToProcess);

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

