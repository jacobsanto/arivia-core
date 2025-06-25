
import { supabase } from '@/integrations/supabase/client';

export interface PropertyOption {
  id: string;
  name: string;
  title: string;
  status?: string;
  location?: string;
  source?: 'guesty' | 'local';
}

interface GuestyAddress {
  full?: string;
  [key: string]: any;
}

export const centralizedPropertyService = {
  async getAllProperties(): Promise<PropertyOption[]> {
    try {
      // Fetch both Guesty and local properties
      const [guestyResult, localResult] = await Promise.all([
        supabase
          .from('guesty_listings')
          .select('id, title, status, address')
          .eq('is_deleted', false)
          .eq('sync_status', 'active')
          .order('title', { ascending: true }),
        supabase
          .from('properties')
          .select('id, name, status, address')
          .order('name', { ascending: true })
      ]);

      const guestyProperties = (guestyResult.data || []).map(listing => {
        const address = listing.address as GuestyAddress | null;
        return {
          id: listing.id,
          name: listing.title,
          title: listing.title,
          status: listing.status || 'active',
          location: address && typeof address === 'object' && address.full 
            ? address.full 
            : 'Unknown location',
          source: 'guesty' as const
        };
      });

      const localProperties = (localResult.data || []).map(property => ({
        id: property.id,
        name: property.name,
        title: property.name,
        status: property.status || 'active',
        location: property.address || 'Unknown location',
        source: 'local' as const
      }));

      // Combine and deduplicate properties
      const allProperties = [...guestyProperties, ...localProperties];
      
      // Remove duplicates based on name (in case a property exists in both systems)
      const uniqueProperties = allProperties.filter((property, index, self) => 
        index === self.findIndex(p => p.name.toLowerCase() === property.name.toLowerCase())
      );

      return uniqueProperties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  async getPropertyById(id: string): Promise<PropertyOption | null> {
    try {
      // Try Guesty first
      const { data: guestyData, error: guestyError } = await supabase
        .from('guesty_listings')
        .select('id, title, status, address')
        .eq('id', id)
        .eq('is_deleted', false)
        .maybeSingle();

      if (!guestyError && guestyData) {
        const address = guestyData.address as GuestyAddress | null;
        return {
          id: guestyData.id,
          name: guestyData.title,
          title: guestyData.title,
          status: guestyData.status || 'active',
          location: address && typeof address === 'object' && address.full 
            ? address.full 
            : 'Unknown location',
          source: 'guesty'
        };
      }

      // Try local properties
      const { data: localData, error: localError } = await supabase
        .from('properties')
        .select('id, name, status, address')
        .eq('id', id)
        .maybeSingle();

      if (!localError && localData) {
        return {
          id: localData.id,
          name: localData.name,
          title: localData.name,
          status: localData.status || 'active',
          location: localData.address || 'Unknown location',
          source: 'local'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }
};
