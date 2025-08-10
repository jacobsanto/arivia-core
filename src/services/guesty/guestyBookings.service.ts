
import { supabase } from '@/integrations/supabase/client';
import { GuestySyncResponse } from './guesty.types';

export const guestyBookingsService = {
  async syncAllBookings(): Promise<GuestySyncResponse> {
    try {
      const { data: listings, error } = await supabase
        .from('guesty_listings')
        .select('id')
        .eq('is_deleted', false)
        .eq('sync_status', 'active');

      if (error) throw error;

      const totalListings = listings?.length || 0;
      let processedCount = 0;
      let totalBookingsSynced = 0;
      let hasMoreListings = true;
      let attempts = 0;
      const MAX_ATTEMPTS = 20;

      while (hasMoreListings && attempts < MAX_ATTEMPTS) {
        attempts++;

        const response = await supabase.functions.invoke('guesty-booking-sync', {
          method: 'POST',
          body: { syncAll: true, totalListings, startIndex: processedCount }
        });

        if (response.error) {
          console.error('Error in booking sync batch:', response.error);
          throw new Error(response.error.message);
        }

        const data = response.data as any;
        processedCount += data.processedCount || 0;
        totalBookingsSynced += data.bookingsSynced || 0;

        hasMoreListings = data.moreListingsToProcess && processedCount < totalListings;
        if (hasMoreListings) {
          console.log(`Processed ${processedCount}/${totalListings} listings, continuing...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return {
        success: true,
        message: `Successfully synced ${totalBookingsSynced} bookings across ${processedCount} listings`,
        bookingsSynced: totalBookingsSynced,
        listingsCount: processedCount
      };
    } catch (error) {
      console.error('Error syncing all bookings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error syncing bookings'
      };
    }
  },

  async syncBookingsForListing(listingId: string): Promise<GuestySyncResponse> {
    try {
      const response = await supabase.functions.invoke('guesty-booking-sync', {
        method: 'POST',
        body: { listingId }
      });

      if (response.error) throw new Error(response.error.message);

      return {
        success: true,
        message: response.data?.message || 'Sync completed',
        bookingsSynced: response.data?.bookingsSynced || 0
      };
    } catch (error) {
      console.error(`Error syncing bookings for listing ${listingId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to sync bookings for listing ${listingId}`
      };
    }
  },
};
