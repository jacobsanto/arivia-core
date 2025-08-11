
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
      // Fetch only local properties since guesty tables don't exist
      const { data: localResult, error } = await supabase
        .from('properties')
        .select('id, name, status, address')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }

      const localProperties = (localResult || []).map(property => ({
        id: property.id,
        name: property.name,
        title: property.name,
        status: property.status || 'active',
        location: property.address || 'Unknown location',
        source: 'local' as const
      }));

      const allProperties = localProperties;
      
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
      // Try local properties only
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
