
import { supabase } from '@/integrations/supabase/client';

export interface PropertyOption {
  id: string;
  name: string;
  title: string;
  status?: string;
  location?: string;
}

interface GuestyAddress {
  full?: string;
  [key: string]: any;
}

export const centralizedPropertyService = {
  async getAllProperties(): Promise<PropertyOption[]> {
    try {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('id, title, status, address')
        .eq('is_deleted', false)
        .eq('sync_status', 'active')
        .order('title', { ascending: true });

      if (error) throw error;

      return (data || []).map(listing => {
        const address = listing.address as GuestyAddress | null;
        return {
          id: listing.id,
          name: listing.title,
          title: listing.title,
          status: listing.status || 'active',
          location: address && typeof address === 'object' && address.full 
            ? address.full 
            : 'Unknown location'
        };
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  async getPropertyById(id: string): Promise<PropertyOption | null> {
    try {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('id, title, status, address')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      const address = data.address as GuestyAddress | null;
      return {
        id: data.id,
        name: data.title,
        title: data.title,
        status: data.status || 'active',
        location: address && typeof address === 'object' && address.full 
          ? address.full 
          : 'Unknown location'
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }
};
