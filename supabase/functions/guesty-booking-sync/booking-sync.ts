
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { BookingSyncResult } from './types.ts';
import { extractRateLimitInfo, delay, calculateBackoff, logApiUsage } from './utils.ts';
import { processBookings } from './process-bookings.ts';
import { cleanObsoleteBookings } from './clean-obsolete.ts';
import { prepareBookings } from './prepare-bookings.ts';

export async function syncBookingsForListing(
  supabase: any,
  token: string,
  listingId: string,
  retries = 2
): Promise<BookingSyncResult> {
  try {
    console.log(`[GuestyBookingSync] Syncing bookings for listing ${listingId}...`);

    // Try to fetch bookings with retries for rate limiting
    let data;
    let rateLimitInfo;
    let attempt = 0;
    
    while (attempt <= retries) {
      const today = new Date().toISOString().split('T')[0];
      const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}`;
      const endpoint = '/v1/reservations';

      console.log(`[GuestyBookingSync] Fetching bookings URL: ${url} (attempt ${attempt + 1}/${retries + 1})`);
      
      try {
        const requestStartTime = Date.now();
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          method: 'GET'
        });
        const requestDuration = Date.now() - requestStartTime;

        // Track API usage for rate limiting monitoring
        rateLimitInfo = extractRateLimitInfo(response.headers);
        
        // Log API usage with extended information
        await logApiUsage(
          supabase,
          endpoint,
          'GET',
          response.status,
          rateLimitInfo,
          listingId
        );

        // Handle rate limiting
        if (response.status === 429) {
          console.warn(`[GuestyBookingSync] Rate limited on listing ${listingId}. Remaining: ${rateLimitInfo.remaining}, Reset: ${rateLimitInfo.reset}`);
          
          if (attempt < retries) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : calculateBackoff(attempt);
            console.log(`[GuestyBookingSync] Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}...`);
            await delay(waitTime);
            attempt++;
            continue;
          }
          throw new Error(`Rate limit exceeded for listing ${listingId}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          const status = response.status;
          throw new Error(`Failed to fetch bookings for listing ${listingId}: ${status} ${response.statusText} - ${errorText}`);
        }

        data = await response.json();
        console.log(`[GuestyBookingSync] Booking data fetched in ${requestDuration}ms. Records: ${data.results?.length || 0}`);
        break; // Success, exit the retry loop
        
      } catch (error) {
        if (error.message && error.message.includes('Rate limit') && attempt < retries) {
          const waitTime = calculateBackoff(attempt);
          console.warn(`[GuestyBookingSync] API error: ${error.message}. Retrying in ${waitTime}ms...`);
          await delay(waitTime);
          attempt++;
        } else {
          throw error; // Re-throw for non-rate-limit errors or if out of retries
        }
      }
    }

    if (!data || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from Guesty reservations endpoint');
    }

    const remoteBookings = data.results.filter(booking =>
      booking.status !== 'cancelled' && booking.status !== 'test'
    );

    console.log(`[GuestyBookingSync] Got ${remoteBookings.length} bookings from Guesty for listing ${listingId}`);
    
    // Convert to Set for faster lookups
    const activeBookingIds = new Set(remoteBookings.map(booking => 
      booking.id || booking._id
    ));
    
    // Mark obsolete bookings as deleted
    const deleted = await cleanObsoleteBookings(supabase, listingId, activeBookingIds);
    
    // Prepare and process the current bookings
    const bookingsToProcess = prepareBookings(remoteBookings);
    const { created, updated } = await processBookings(supabase, bookingsToProcess);

    console.log(`[GuestyBookingSync] [${listingId}] Created: ${created}, Updated: ${updated}, Deleted: ${deleted}`);

    return {
      total: remoteBookings.length,
      created,
      updated,
      deleted,
      endpoint: '/v1/reservations',
    };
  } catch (error) {
    console.error(`[GuestyBookingSync] Error in syncBookingsForListing for listing ${listingId}:`, error);
    throw error;
  }
}
