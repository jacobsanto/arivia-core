
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';

export interface GuestyListing {
  _id: string;
  title: string;
  address?: {
    full?: string;
    city?: string;
    country?: string;
  };
  status?: string;
  propertyType?: string;
  cleaningStatus?: {
    value: string;
  };
  picture?: {
    thumbnail?: string;
  };
}

export interface GuestyListingDB {
  id: string;
  title: string;
  address: any;
  status: string;
  property_type: string;
  thumbnail_url: string;
  highres_url?: string;
  sync_status: string;
  last_synced: string;
  raw_data: any;
  created_at: string;
  updated_at: string;
  first_synced_at: string;
  is_deleted: boolean;
}

export const guestyService = {
  ensureValidToken: async (): Promise<boolean> => {
    try {
      console.log('Checking Guesty token validity');
      const { data, error } = await supabase.functions.invoke('guesty-health-check');
      if (error) {
        console.error('Error validating Guesty token:', error);
        throw error;
      }
      
      return data?.health?.status === 'connected';
    } catch (err: any) {
      console.error('Error validating Guesty token:', err);
      throw new Error(err.message || 'Failed to validate Guesty token');
    }
  },
  
  syncListings: async () => {
    try {
      console.log('Initiating Guesty sync...');
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        listingsCount: number;
        bookingsSynced: number;
        error?: string;
      }>('guesty-sync');

      if (error) {
        console.error('Error in guesty-sync function call:', error);
        throw error;
      }
      
      if (!data.success) {
        console.error('Guesty sync unsuccessful:', data);
        throw new Error(data.message || data.error || 'Failed to sync listings');
      }

      console.log('Guesty sync completed successfully:', data);
      return {
        success: true,
        listingsCount: data.listingsCount || 0,
        bookingsSynced: data.bookingsSynced || 0,
        message: data.message
      };
    } catch (err: any) {
      console.error('Error syncing Guesty listings:', err);
      
      // Check for rate limit errors
      if (err.message?.includes('Too Many Requests') || 
          err.message?.includes('Rate limit') || 
          err.message?.includes('Please wait before syncing again')) {
        return {
          success: false,
          listingsCount: 0,
          bookingsSynced: 0,
          message: 'Rate limit exceeded. Please wait a few minutes before trying again.'
        };
      }
      
      // For other errors provide the specific error message
      return {
        success: false,
        listingsCount: 0,
        bookingsSynced: 0,
        message: err.message || 'Failed to sync listings'
      };
    }
  },
  
  getGuestyListings: async (): Promise<GuestyListingDB[]> => {
    try {
      console.log('Fetching Guesty listings from database');
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('is_deleted', false)
        .order('title');
      
      if (error) {
        console.error('Database error fetching Guesty listings:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} Guesty listings`);
      return data || [];
    } catch (err: any) {
      console.error('Error fetching Guesty listings:', err);
      toastService.error('Failed to fetch listings', {
        description: err.message
      });
      throw err;
    }
  },

  syncAllBookings: async () => {
    try {
      console.log('Initiating full Guesty bookings sync');
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        bookingsSynced: number;
        created?: number;
        updated?: number;
        deleted?: number;
        error?: string;
      }>('guesty-booking-sync', {
        body: { syncAll: true }
      });

      if (error) {
        console.error('Error in guesty-booking-sync function call:', error);
        throw error;
      }
      
      if (!data.success) {
        console.error('Guesty bookings sync unsuccessful:', data);
        throw new Error(data.message || data.error || 'Failed to sync bookings');
      }

      console.log('Guesty bookings sync completed successfully:', data);
      
      return {
        success: true,
        bookingsSynced: data.bookingsSynced || 0,
        created: data.created || 0,
        updated: data.updated || 0, 
        deleted: data.deleted || 0,
        message: data.message
      };
    } catch (err: any) {
      console.error('Error syncing all bookings:', err);
      return {
        success: false,
        bookingsSynced: 0,
        message: err.message || 'Failed to sync bookings'
      };
    }
  },

  syncBookingsForListing: async (listingId: string) => {
    try {
      console.log(`Syncing bookings for listing ${listingId}`);
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        bookingsSynced: number;
        error?: string;
      }>('guesty-booking-sync', {
        body: { listingId }
      });

      if (error) {
        console.error(`Error in guesty-booking-sync function call for listing ${listingId}:`, error);
        throw error;
      }
      
      if (!data.success) {
        console.error(`Guesty bookings sync unsuccessful for listing ${listingId}:`, data);
        throw new Error(data.message || data.error || 'Failed to sync bookings');
      }

      console.log(`Guesty bookings sync completed for listing ${listingId}:`, data);

      return {
        success: true,
        bookingsSynced: data.bookingsSynced || 0,
        message: data.message
      };
    } catch (err: any) {
      console.error(`Error syncing bookings for listing ${listingId}:`, err);
      return {
        success: false,
        bookingsSynced: 0,
        message: err.message || 'Failed to sync bookings'
      };
    }
  }
};
