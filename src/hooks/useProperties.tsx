
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { GuestyProperty } from '@/integrations/guesty/types';  // Import the Guesty Property type

export interface Property {
  id: string;
  name: string;
  location: string;
  status: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  imageUrl: string;
  description?: string;
  address: string;
  max_guests: number;
  price_per_night: number;
  created_at: string;
  updated_at: string;
  // Add these new properties for Guesty integration
  guesty_id?: string;
  guesty_data?: GuestyProperty;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to match the expected Property interface
      const formattedProperties = data.map(item => ({
        id: item.id,
        name: item.name,
        location: item.address?.split(',').pop()?.trim() || 'Greece',
        status: item.status || 'Vacant',
        type: 'Luxury Villa', // Default value, you might want to add this column to the table
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

      setProperties(formattedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message);
      toastService.error('Failed to fetch properties', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
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

      await fetchProperties(); // Refresh the list
      return data[0];
    } catch (err: any) {
      console.error('Error adding property:', err);
      toastService.error('Failed to add property', {
        description: err.message
      });
      throw err;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
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

      await fetchProperties(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Error updating property:', err);
      toastService.error('Failed to update property', {
        description: err.message
      });
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      await fetchProperties(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Error deleting property:', err);
      toastService.error('Failed to delete property', {
        description: err.message
      });
      throw err;
    }
  };

  const getPropertyBookings = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching property bookings:', err);
      toastService.error('Failed to fetch bookings', {
        description: err.message
      });
      return [];
    }
  };

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyBookings
  };
};
