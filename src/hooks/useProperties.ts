
import { useState, useEffect } from 'react';
import { propertyService } from '@/services/property/property.service';
import type { Property, PropertyFormData } from '@/types/property.types';
import { toast } from '@/hooks/use-toast';

// Re-export the Property type
export type { Property } from '@/types/property.types';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await propertyService.fetchProperties();
      setProperties(data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load properties';
      setError(errorMessage);
      console.error('Properties fetch error:', err);
      
      toast({
        title: "Error Loading Properties",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Provide fallback empty array
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (propertyData: PropertyFormData) => {
    try {
      const newProperty = await propertyService.addProperty(propertyData);
      await fetchProperties(); // Refresh the list
      return newProperty;
    } catch (err: any) {
      throw err;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<PropertyFormData>) => {
    try {
      await propertyService.updateProperty(id, propertyData);
      await fetchProperties(); // Refresh the list
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertyService.deleteProperty(id);
      await fetchProperties(); // Refresh the list
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const getPropertyBookings = propertyService.getPropertyBookings;

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
