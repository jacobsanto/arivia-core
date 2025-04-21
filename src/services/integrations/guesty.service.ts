
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface GuestyCredentials extends Record<string, Json> {
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export interface GuestyListingItem {
  id: string;
  title: string;
  nickname?: string;
  picture?: string;
  address?: {
    full: string;
    city: string;
    country: string;
  };
}

export interface GuestyBookingItem {
  id: string;
  status: string;
  guestName: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  listingId: string;
  money: {
    totalPaid: number;
    currency: string;
  };
}

export interface GuestyPropertyMapping {
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

  async fetchListings(limit = 20, offset = 0): Promise<GuestyListingItem[]> {
    try {
      const response = await supabase.functions.invoke('guesty', {
        body: {
          action: 'listings',
          limit,
          offset
        }
      });

      if (response.error) throw new Error(response.error.message);
      // Compatible with the edge function return shape
      return response.data?.results || response.data?.data?.results || [];
    } catch (error) {
      console.error('Failed to fetch Guesty listings:', error);
      throw error;
    }
  }

  async fetchBookings(
    limit = 20, 
    offset = 0,
    startDate?: string,
    endDate?: string
  ): Promise<GuestyBookingItem[]> {
    try {
      const response = await supabase.functions.invoke('guesty', {
        body: {
          action: 'bookings',
          limit,
          offset,
          startDate,
          endDate
        }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data?.results || response.data?.data?.results || [];
    } catch (error) {
      console.error('Failed to fetch Guesty bookings:', error);
      throw error;
    }
  }

  async syncProperty(propertyId: string, guestyListingId: string): Promise<GuestyPropertyMapping> {
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
  async getMappings(): Promise<GuestyPropertyMapping[]> {
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
