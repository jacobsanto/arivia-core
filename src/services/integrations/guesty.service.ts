
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface GuestyCredentials extends Record<string, Json> {
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export interface GuestyListingItem {
  id: string; // Using id for backwards compatibility, but maps to _id in v3 API
  _id?: string;
  title: string;
  nickname?: string;
  picture?: {
    thumbnail?: string;
    full?: string;
  };
  address?: {
    full: string;
    city: string;
    country: string;
    location?: {
      coordinates: [number, number];
      type: string;
    };
  };
}

export interface GuestyBookingItem {
  id: string; // Using id for backwards compatibility, but maps to _id in v3 API
  _id?: string;
  status: string;
  guest: {
    fullName: string;
    email?: string;
    phone?: string;
  };
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  listingId: string;
  money: {
    totalPaid: number;
    currency: string;
  };
}

export interface GuestyPropertyMappingType {
  property_id: string;
  guesty_listing_id: string;
  created_at: string;
  updated_at: string;
}

class GuestyService {
  async saveIntegrationSettings(credentials: GuestyCredentials): Promise<boolean> {
    try {
      // Ensure credentials are stored in a JSON-compatible shape
      const settings: Record<string, Json> = {
        guesty: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          enabled: credentials.enabled,
        }
      };

      const { error } = await supabase.from('system_settings').upsert({
        category: 'integration',
        settings: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'category'
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save Guesty integration settings:', error);
      return false;
    }
  }

  async getIntegrationSettings(): Promise<GuestyCredentials | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings')
        .eq('category', 'integration')
        .maybeSingle();

      if (error) throw error;

      if (data?.settings && typeof data.settings === "object" && data.settings !== null) {
        const settings = data.settings as Record<string, unknown>;
        if (typeof settings.guesty === "object" && settings.guesty !== null) {
          // Appropriately shape the return value as GuestyCredentials
          const guestyCreds = settings.guesty as {
            clientId?: string;
            clientSecret?: string;
            enabled?: boolean;
          };
          return {
            clientId: guestyCreds.clientId ?? "",
            clientSecret: guestyCreds.clientSecret ?? "",
            enabled: guestyCreds.enabled ?? false
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get Guesty integration settings:', error);
      return null;
    }
  }

  async fetchListings(limit = 20, cursor?: string): Promise<GuestyListingItem[]> {
    try {
      const body: Record<string, any> = {
        action: 'listings',
        limit
      };
      
      if (cursor) {
        body.cursor = cursor;
      }
      
      const response = await supabase.functions.invoke('guesty', {
        body
      });

      if (response.error) throw new Error(response.error.message);
      
      // Map response based on new v3 API format
      const results = response.data?.data?.results || response.data?.results || [];
      
      // Format listings to maintain backward compatibility
      return results.map((listing: any) => ({
        id: listing._id || listing.id,
        _id: listing._id || listing.id,
        title: listing.title || listing.name || '',
        nickname: listing.nickname || '',
        picture: {
          thumbnail: listing.picture?.thumbnail || listing.picture || '',
          full: listing.picture?.full || listing.picture || '',
        },
        address: listing.address || {}
      }));
    } catch (error) {
      console.error('Failed to fetch Guesty listings:', error);
      throw error;
    }
  }

  async fetchBookings(
    limit = 20, 
    cursor?: string,
    startDate?: string,
    endDate?: string
  ): Promise<GuestyBookingItem[]> {
    try {
      const body: Record<string, any> = {
        action: 'bookings',
        limit
      };
      
      if (cursor) {
        body.cursor = cursor;
      }
      
      if (startDate) {
        body.startDate = startDate;
      }
      
      if (endDate) {
        body.endDate = endDate;
      }
      
      const response = await supabase.functions.invoke('guesty', {
        body
      });

      if (response.error) throw new Error(response.error.message);
      
      // Map response based on new v3 API format
      const results = response.data?.data?.results || response.data?.results || [];
      
      // Format bookings to maintain backward compatibility
      return results.map((booking: any) => ({
        id: booking._id || booking.id,
        _id: booking._id || booking.id,
        status: booking.status,
        guest: booking.guest || { fullName: booking.guestName || 'Guest' },
        checkInDateLocalized: booking.checkInDateLocalized || booking.checkIn,
        checkOutDateLocalized: booking.checkOutDateLocalized || booking.checkOut,
        listingId: booking.listingId || booking.accommodationId,
        money: booking.money || { totalPaid: 0, currency: 'USD' }
      }));
    } catch (error) {
      console.error('Failed to fetch Guesty bookings:', error);
      throw error;
    }
  }

  async syncProperty(propertyId: string, guestyListingId: string): Promise<GuestyPropertyMappingType> {
    try {
      const response = await supabase.functions.invoke('guesty', {
        body: {
          action: 'sync-property',
          propertyId,
          guestyListingId
        }
      });

      if (response.error) throw new Error(response.error.message);
      // Return single mapping from array if present, or fall back for BC
      const resData = response.data?.data || response.data?.data?.[0] || response.data;
      if (Array.isArray(resData)) {
        return resData[0];
      }
      return resData;
    } catch (error) {
      console.error('Failed to sync property with Guesty:', error);
      throw error;
    }
  }

  // Always use edge function, not direct table for mappings.
  async getMappings(): Promise<GuestyPropertyMappingType[]> {
    try {
      const response = await supabase.functions.invoke('guesty', {
        body: {
          action: 'get-mappings'
        }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to get Guesty property mappings:', error);
      return [];
    }
  }

  async deleteMapping(propertyId: string): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('guesty', {
        body: {
          action: 'delete-mapping',
          propertyId
        }
      });

      if (response.error) throw new Error(response.error.message);
      return !!response.data?.success;
    } catch (error) {
      console.error('Failed to delete Guesty property mapping:', error);
      return false;
    }
  }
}

export const guestyService = new GuestyService();
