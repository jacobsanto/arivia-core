
import { supabase } from '@/integrations/supabase/client';

export interface GuestyListingDB {
  id: string;
  title: string;
  status?: string;
  address?: {
    full?: string;
    city?: string;
    country?: string;
  } | null;
  property_type?: string;
  raw_data?: Record<string, any>;
  thumbnail_url?: string;
  highres_url?: string;
  sync_status?: string;
  is_deleted?: boolean;
  last_synced?: string;
  created_at?: string;
  updated_at?: string;
  first_synced_at?: string;
}

export interface GuestyBookingDB {
  id: string;
  listing_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  raw_data?: Record<string, any>;
}

export interface GuestySyncResponse {
  success: boolean;
  message?: string;
  listingsCount?: number;
  bookingsSynced?: number;
  error?: string;
  moreListingsToProcess?: boolean;
  processedCount?: number;
}

export const guestyService = {
  async getGuestyListings(): Promise<GuestyListingDB[]> {
    try {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('is_deleted', false)
        .order('title', { ascending: true });

      if (error) throw error;
      
      // Make sure we correctly cast the data to the GuestyListingDB type
      return (data || []).map(item => ({
        ...item,
        address: typeof item.address === 'string' 
          ? JSON.parse(item.address) 
          : item.address
      })) as GuestyListingDB[];
    } catch (error) {
      console.error('Error fetching Guesty listings:', error);
      throw error;
    }
  },

  async ensureValidToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('guesty-health-check', {
        method: 'POST',
      });
      if (error) throw error;
      return data?.valid || false;
    } catch (error) {
      console.error('Error checking Guesty token:', error);
      throw error;
    }
  },

  async syncListings(): Promise<GuestySyncResponse> {
    try {
      const response = await supabase.functions.invoke('guesty-sync', {
        method: 'POST',
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data as GuestySyncResponse;
    } catch (error) {
      console.error('Error syncing Guesty listings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error syncing listings'
      };
    }
  },

  async syncAllBookings(): Promise<GuestySyncResponse> {
    try {
      // First, get the count of active listings to sync
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
      const MAX_ATTEMPTS = 20; // Safety limit for number of sequential calls
      
      while (hasMoreListings && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        const response = await supabase.functions.invoke('guesty-booking-sync', {
          method: 'POST',
          body: { 
            syncAll: true,
            totalListings,
            startIndex: processedCount
          }
        });
        
        if (response.error) {
          console.error('Error in booking sync batch:', response.error);
          throw new Error(response.error.message);
        }
        
        const data = response.data as any;
        processedCount += data.processedCount || 0;
        totalBookingsSynced += data.bookingsSynced || 0;
        
        // Check if we need to continue syncing
        hasMoreListings = data.moreListingsToProcess && processedCount < totalListings;
        
        // If we have more to process, wait a bit between calls to avoid overwhelming the system
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
  }
};
