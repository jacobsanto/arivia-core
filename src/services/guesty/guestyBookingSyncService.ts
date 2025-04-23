
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GuestySyncResponse } from './guesty.types';

interface SyncBookingsResult {
  success: boolean;
  message: string;
  bookingsSynced?: number;
  error?: string;
}

export const guestyBookingSyncService = {
  async syncAllBookings(): Promise<SyncBookingsResult> {
    try {
      const result = await guestyService.syncAllBookings();
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully synced ${result.bookingsSynced} bookings across ${result.listingsCount} listings`,
          bookingsSynced: result.bookingsSynced
        };
      } else {
        return {
          success: false,
          message: 'Failed to sync bookings',
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async syncBookingsForListing(listingId: string): Promise<SyncBookingsResult> {
    try {
      const response = await supabase.functions.invoke('guesty-booking-sync', {
        method: 'POST',
        body: { listingId }
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data as any;
      return {
        success: true,
        message: `Successfully synced ${data.bookingsSynced || 0} bookings`,
        bookingsSynced: data.bookingsSynced || 0
      };
    } catch (error) {
      console.error(`Error syncing bookings for listing ${listingId}:`, error);
      return {
        success: false,
        message: 'Failed to sync bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async syncBookingsWithProgress(): Promise<SyncBookingsResult> {
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
        
        // Update progress if we have a UI component to display it
        toast.info(`Syncing bookings: ${processedCount}/${totalListings} listings processed`);

        if (hasMoreListings) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return {
        success: true,
        message: `Successfully synced ${totalBookingsSynced} bookings across ${processedCount} listings`,
        bookingsSynced: totalBookingsSynced
      };
    } catch (error) {
      console.error('Error syncing all bookings with progress:', error);
      return {
        success: false,
        message: 'Failed to sync bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Import guestyService here to avoid circular dependency
import { guestyService } from './guesty.service';
