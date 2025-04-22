
import { createClient } from '@supabase/supabase-js';
import { delay, extractRateLimitInfo } from './utils.ts';

interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export async function syncBookingsForListing(
  supabase: any,
  token: string,
  listingId: string
): Promise<BookingSyncResult> {
  try {
    console.log(`Syncing bookings for listing ${listingId}...`);
    
    const today = new Date().toISOString().split('T')[0];
    let allBookings: any[] = [];
    let page = 1;
    let hasMore = true;
    let endpoint = 'v1/listings/bookings';
    
    while (hasMore) {
      console.log(`Fetching page ${page} of bookings for listing ${listingId}...`);
      
      const response = await fetch(
        `https://open-api.guesty.com/v1/listings/${listingId}/bookings?page=${page}&limit=100&startDate[gte]=${today}`, 
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
              endpoint: endpoint,
              rate_limit: rateLimitInfo.rate_limit,
              remaining: rateLimitInfo.remaining,
              reset: rateLimitInfo.reset,
              timestamp: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error storing rate limit info:', error);
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings for listing ${listingId}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.results)) {
        console.error('Invalid response format from Guesty API:', data);
        throw new Error('Invalid response format from Guesty API');
      }
      
      const validBookings = data.results.filter(booking => 
        booking.status !== 'cancelled' && 
        booking.status !== 'test'
      );
      
      allBookings = [...allBookings, ...validBookings];
      
      if (data.results.length < 100) {
        hasMore = false;
      } else {
        page++;
        if (rateLimitInfo && rateLimitInfo.remaining < 10) {
          await delay(1000);
        }
      }
    }

    console.log(`Found ${allBookings.length} valid bookings for listing ${listingId}`);

    const deleted = await cleanObsoleteBookings(supabase, listingId, allBookings);

    let created = 0;
    let updated = 0;

    for (const booking of allBookings) {
      if (!booking._id || !booking.listing || !booking.listing._id) {
        console.error('Invalid booking data received:', booking);
        continue;
      }
      
      const guestName = booking.guest?.fullName || 'Guest';
      
      const bookingData = {
        id: booking._id,
        listing_id: booking.listing._id,
        guest_name: guestName,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        status: booking.status,
        last_synced: new Date().toISOString(),
        raw_data: booking
      };

      try {
        const { data: existingBooking, error: selectError } = await supabase
          .from('guesty_bookings')
          .select('id')
          .eq('id', booking._id)
          .maybeSingle();

        if (selectError) {
          console.error(`Error checking for existing booking ${booking._id}:`, selectError);
          continue;
        }

        if (!existingBooking) {
          const { error: insertError } = await supabase
            .from('guesty_bookings')
            .insert(bookingData);
          
          if (insertError) {
            console.error(`Error inserting booking ${booking._id}:`, insertError);
            continue;
          }
          created++;
        } else {
          const { error: updateError } = await supabase
            .from('guesty_bookings')
            .update(bookingData)
            .eq('id', booking._id);
          
          if (updateError) {
            console.error(`Error updating booking ${booking._id}:`, updateError);
            continue;
          }
          updated++;
        }
      } catch (error) {
        console.error(`Error processing booking ${booking._id}:`, error);
      }

      await delay(100);
    }

    console.log(`Sync completed for listing ${listingId}: ${created} created, ${updated} updated, ${deleted} deleted/cancelled`);
    return { 
      total: allBookings.length,
      created, 
      updated, 
      deleted,
      endpoint
    };

  } catch (error) {
    console.error(`Error in syncBookingsForListing for ${listingId}:`, error);
    throw error;
  }
}

async function cleanObsoleteBookings(
  supabase: any,
  listingId: string,
  activeBookings: any[]
): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeBookingIds = new Set(activeBookings.map(b => b._id));

    const { data: localBookings, error } = await supabase
      .from('guesty_bookings')
      .select('id')
      .eq('listing_id', listingId)
      .gt('check_out', today)
      .neq('status', 'cancelled');
      
    if (error) {
      console.error(`Error fetching local bookings for listing ${listingId}:`, error);
      return 0;
    }

    if (!localBookings || localBookings.length === 0) {
      return 0;
    }
    
    const bookingsToCancel = localBookings.filter(b => !activeBookingIds.has(b.id));
    
    if (bookingsToCancel.length === 0) {
      return 0;
    }
    
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
      return 0;
    }
    
    return bookingsToCancel.length;
  } catch (error) {
    console.error(`Error cleaning obsolete bookings for listing ${listingId}:`, error);
    return 0;
  }
}
