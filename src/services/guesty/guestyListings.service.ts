
import { supabase } from '@/integrations/supabase/client';
import { GuestyListingDB } from './guesty.types';

export const guestyListingsService = {
  async getGuestyListings(): Promise<GuestyListingDB[]> {
    try {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('is_deleted', false)
        .order('title', { ascending: true });

      if (error) throw error;

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
};
