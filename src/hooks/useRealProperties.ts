import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyOption {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  description?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useRealProperties = () => {
  const { data: properties, isLoading, error, refetch } = useQuery<PropertyOption[], Error>({
    queryKey: ['real-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    properties: properties || [],
    isLoading,
    error,
    refetch
  };
};

export const useRealProperty = (propertyId: string | null) => {
  const { data: property, isLoading, error } = useQuery<PropertyOption | null, Error>({
    queryKey: ['real-property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    property,
    isLoading,
    error
  };
};