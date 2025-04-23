
import { BatchProcessResult, ListingProcessResult } from './types.ts';

export async function processListings(
  supabase: any,
  token: string,
  listingIds: string[],
  startTime: number,
  maxRuntime: number
): Promise<BatchProcessResult> {
  console.log(`Processing ${listingIds.length} listings`);
  
  const results: ListingProcessResult[] = [];
  let totalBookingsSynced = 0;
  let created = 0;
  let updated = 0;
  let deleted = 0;
  
  for (const listingId of listingIds) {
    // Check if we're approaching the function timeout
    if (Date.now() - startTime > maxRuntime - 5000) {
      console.log(`Approaching max runtime, stopping processing`);
      break;
    }
    
    try {
      console.log(`Fetching bookings for listing: ${listingId}`);
      
      // Fetch bookings from Guesty
      const response = await fetch(`https://open-api.guesty.com/v1/reservations?listingId=${listingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const bookings = data.results || [];
      console.log(`Found ${bookings.length} bookings for listing ${listingId}`);
      
      if (bookings.length > 0) {
        // Transform bookings to our format
        const formattedBookings = bookings.map((booking: any) => {
          // Extract guest information safely
          const guestInfo = booking.guest || {};
          const guestName = guestInfo.fullName || '';
          
          // Process booking
          return {
            id: booking._id,
            listing_id: listingId,
            check_in: booking.checkIn || booking.startDate,
            check_out: booking.checkOut || booking.endDate,
            guest_name: guestName,
            guest_email: guestInfo.email,
            status: booking.status || 'inquiry',
            source: booking.source || 'guesty',
            raw_data: booking,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
        
        // Insert or update bookings
        const { error } = await supabase
          .from('guesty_bookings')
          .upsert(formattedBookings, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (error) {
          throw new Error(`Failed to upsert bookings: ${error.message}`);
        }
        
        // Log successful sync
        await supabase.from('sync_logs').insert({
          provider: 'guesty',
          sync_type: 'bookings',
          status: 'completed',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          message: `Synced ${formattedBookings.length} bookings for listing ${listingId}`
        });
        
        // Track metrics
        totalBookingsSynced += formattedBookings.length;
        updated += formattedBookings.length; // In reality, we'd need to track this differently
        
        results.push({
          listingId,
          success: true,
          bookingsCount: formattedBookings.length
        });
      } else {
        // No bookings found, but the API call was successful
        results.push({
          listingId,
          success: true,
          bookingsCount: 0
        });
      }
    } catch (error) {
      console.error(`Error processing listing ${listingId}:`, error);
      
      // Log error but continue with other listings
      results.push({
        listingId,
        success: false,
        bookingsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Log error to sync_logs
      await supabase.from('sync_logs').insert({
        provider: 'guesty',
        sync_type: 'bookings',
        status: 'error',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        message: `Error syncing bookings for listing ${listingId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Add a delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return {
    results,
    totalBookingsSynced,
    created,
    updated,
    deleted
  };
}
