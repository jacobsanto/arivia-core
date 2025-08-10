
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { UnifiedProperty } from '@/types/property.types';
import { SortOption } from '@/components/properties/PropertySort';

export const unifiedPropertyService = {
  async fetchAllProperties(sortOption?: SortOption, searchQuery?: string): Promise<UnifiedProperty[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          id,
          name,
          status,
          address,
          created_at,
          updated_at
        `);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (sortOption) {
        query = query.order(sortOption.column, { ascending: sortOption.ascending });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      const properties = (data || []).map((p: any) => this.transformPropertyToUnified(p));
      return properties;
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      toastService.error('Failed to fetch properties', {
        description: err.message
      });
      return [];
    }
  },

  transformPropertyToUnified(property: any): UnifiedProperty {
    return {
      id: property.id,
      name: property.name,
      location: property.address || 'Unknown location',
      status: property.status || 'Unknown',
      type: 'Property',
      bedrooms: 0,
      bathrooms: 0,
      price: 0,
      price_per_night: 0,
      imageUrl: '/placeholder.svg',
      description: '',
      address: property.address || '',
      max_guests: 0,
      created_at: property.created_at || new Date().toISOString(),
      updated_at: property.updated_at || new Date().toISOString(),
      source: 'local',
      guesty_id: undefined,
      last_synced: undefined,
      raw_data: {}
    };
  },

  async getPropertyBookings(propertyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      console.error('Error fetching property bookings:', err);
      toastService.error('Failed to fetch bookings', {
        description: err.message
      });
      return [];
    }
  }
};
