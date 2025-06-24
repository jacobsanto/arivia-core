
import { supabase } from '@/integrations/supabase/client';
import { GuestyListingDB } from '@/services/guesty/guesty.types';

export interface PropertyOption {
  id: string;
  name: string;
  title: string;
  status?: string;
  location?: string;
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

      return (data || []).map(listing => ({
        id: listing.id,
        name: listing.title,
        title: listing.title,
        status: listing.status || 'active',
        location: typeof listing.address === 'object' && listing.address?.full 
          ? listing.address.full 
          : 'Unknown location'
      }));
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

      return {
        id: data.id,
        name: data.title,
        title: data.title,
        status: data.status || 'active',
        location: typeof data.address === 'object' && data.address?.full 
          ? data.address.full 
          : 'Unknown location'
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }
};
