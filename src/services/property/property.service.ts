
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { Property, PropertyFormData } from '@/types/property.types';

export const propertyService = {
  async fetchProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to match the expected Property interface
      return data.map(item => ({
        id: item.id,
        name: item.name,
        location: item.address?.split(',').pop()?.trim() || 'Greece',
        status: item.status || 'Vacant',
        type: 'Luxury Villa', // Default value
        bedrooms: 2, // Default since num_bedrooms doesn't exist
        bathrooms: 2, // Default since num_bathrooms doesn't exist
        price: 200, // Default since price_per_night doesn't exist
        price_per_night: 200,
        imageUrl: '/placeholder.svg',
        description: 'Beautiful property',
        address: item.address,
        max_guests: 4, // Default since max_guests doesn't exist
        created_at: item.created_at,
        updated_at: item.updated_at,
        assigned_users: (item as any).assigned_users || []
      }));
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      toastService.error('Failed to fetch properties', {
        description: err.message
      });
      throw err;
    }
  },

  async addProperty(propertyData: PropertyFormData): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          name: propertyData.name,
          address: propertyData.address,
          status: propertyData.status
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Transform the response to match our Property interface
      const newProperty: Property = {
        id: data[0].id,
        name: data[0].name,
        location: data[0].address?.split(',').pop()?.trim() || 'Greece',
        status: data[0].status || 'Vacant',
        type: 'Luxury Villa',
        bedrooms: propertyData.bedrooms || 2,
        bathrooms: propertyData.bathrooms || 2,
        price: propertyData.price || 200,
        price_per_night: propertyData.price || 200,
        imageUrl: propertyData.imageUrl || '/placeholder.svg',
        description: propertyData.description || 'Beautiful property',
        address: data[0].address,
        max_guests: propertyData.max_guests || 4,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at
      };

      return newProperty;
    } catch (err: any) {
      console.error('Error adding property:', err);
      toastService.error('Failed to add property', {
        description: err.message
      });
      throw err;
    }
  },

  async updateProperty(id: string, propertyData: Partial<PropertyFormData>): Promise<boolean> {
    try {
      // Map only fields that exist in the properties table
      const dbData: any = {};
      
      if (propertyData.name) dbData.name = propertyData.name;
      if (propertyData.address) dbData.address = propertyData.address;
      if (propertyData.status) dbData.status = propertyData.status;
      
      const { error } = await supabase
        .from('properties')
        .update(dbData)
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error updating property:', err);
      toastService.error('Failed to update property', {
        description: err.message
      });
      throw err;
    }
  },

  async deleteProperty(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting property:', err);
      toastService.error('Failed to delete property', {
        description: err.message
      });
      throw err;
    }
  },

  async getPropertyBookings(propertyId: string): Promise<any[]> {
    try {
      // Return empty array since bookings table doesn't exist
      return [];
    } catch (err: any) {
      console.error('Error fetching property bookings:', err);
      toastService.error('Failed to fetch bookings', {
        description: err.message
      });
      return [];
    }
  }
};
