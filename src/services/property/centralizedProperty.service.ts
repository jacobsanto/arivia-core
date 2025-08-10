
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
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, status, address')
        .order('name', { ascending: true });

      if (error) throw error;

      const localProperties: PropertyOption[] = (data || []).map((property: any) => ({
        id: property.id,
        name: property.name,
        title: property.name,
        status: property.status || 'active',
        location: property.address || 'Unknown location',
        source: 'local'
      }));

      return localProperties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  async getPropertyById(id: string): Promise<PropertyOption | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, status, address')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        title: data.name,
        status: data.status || 'active',
        location: data.address || 'Unknown location',
        source: 'local'
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }
};
