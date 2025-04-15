
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
        bedrooms: item.num_bedrooms,
        bathrooms: item.num_bathrooms,
        price: item.price_per_night,
        price_per_night: item.price_per_night,
        imageUrl: item.image_url || '/placeholder.svg',
        description: item.description,
        address: item.address,
        max_guests: item.max_guests,
        created_at: item.created_at,
        updated_at: item.updated_at
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
          num_bedrooms: propertyData.bedrooms,
          num_bathrooms: propertyData.bathrooms,
          price_per_night: propertyData.price,
          max_guests: propertyData.max_guests,
          image_url: propertyData.imageUrl,
          description: propertyData.description,
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
        bedrooms: data[0].num_bedrooms,
        bathrooms: data[0].num_bathrooms,
        price: data[0].price_per_night,
        price_per_night: data[0].price_per_night,
        imageUrl: data[0].image_url || '/placeholder.svg',
        description: data[0].description,
        address: data[0].address,
        max_guests: data[0].max_guests,
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
      // Map the property data to the database columns
      const dbData: any = {};
      
      if (propertyData.name) dbData.name = propertyData.name;
      if (propertyData.address) dbData.address = propertyData.address;
      if (propertyData.bedrooms) dbData.num_bedrooms = propertyData.bedrooms;
      if (propertyData.bathrooms) dbData.num_bathrooms = propertyData.bathrooms;
      if (propertyData.price) dbData.price_per_night = propertyData.price;
      if (propertyData.max_guests) dbData.max_guests = propertyData.max_guests;
      if (propertyData.imageUrl) dbData.image_url = propertyData.imageUrl;
      if (propertyData.description) dbData.description = propertyData.description;
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
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

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
