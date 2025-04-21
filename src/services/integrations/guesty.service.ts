
import { supabase } from '@/integrations/supabase/client';

export interface GuestyCredentials {
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
      const { data, error } = await supabase.from('system_settings').upsert({
        category: 'integration',
        settings: { guesty: credentials },
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
      
      if (data?.settings?.guesty) {
        return data.settings.guesty as GuestyCredentials;
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
      return response.data.results || [];
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
      return response.data.results || [];
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
      return response.data;
    } catch (error) {
      console.error('Failed to sync property with Guesty:', error);
      throw error;
    }
  }
  
  async getMappings(): Promise<GuestyPropertyMapping[]> {
    try {
      const { data, error } = await supabase
        .from('guesty_properties')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get Guesty property mappings:', error);
      return [];
    }
  }
  
  async deleteMapping(propertyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('guesty_properties')
        .delete()
        .eq('property_id', propertyId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete Guesty property mapping:', error);
      return false;
    }
  }
}

export const guestyService = new GuestyService();
