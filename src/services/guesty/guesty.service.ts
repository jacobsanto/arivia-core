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
      const { data, error } = await supabase.functions.invoke('guesty-health-check');
      if (error) throw error;
      
      return data?.health?.status === 'connected';
    } catch (err: any) {
      console.error('Error validating Guesty token:', err);
      throw new Error(err.message || 'Failed to validate Guesty token');
    }
  },
  
  syncListings: async () => {
    try {
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        listingsCount: number;
        bookingsSynced: number;
      }>('guesty-sync');

      if (error) throw error;
      if (!data.success) throw new Error(data.message || 'Failed to sync listings');

      return {
        success: true,
        listingsCount: data.listingsCount || 0,
        bookingsSynced: data.bookingsSynced || 0,
        message: data.message
      };
    } catch (err: any) {
      console.error('Error syncing Guesty listings:', err);
      if (err.message?.includes('Please wait before syncing again')) {
        return {
          success: false,
          listingsCount: 0,
          bookingsSynced: 0,
          message: 'Rate limit exceeded. Please wait a few minutes before trying again.'
        };
      }
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
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('is_deleted', false)
        .order('title');
      
      if (error) throw error;
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
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        bookingsSynced: number;
        created?: number;
        updated?: number;
        deleted?: number;
      }>('guesty-booking-sync', {
        body: { syncAll: true }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message || 'Failed to sync bookings');

      console.log('Bookings sync result:', data);
      
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
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        message?: string;
        bookingsSynced: number;
      }>('guesty-booking-sync', {
        body: { listingId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message || 'Failed to sync bookings');

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
