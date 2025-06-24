
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { centralizedPropertyService, PropertyOption } from '@/services/property/centralizedProperty.service';

export const useRealProperties = () => {
  const { data: properties, isLoading, error, refetch } = useQuery<PropertyOption[], Error>({
    queryKey: ['real-properties'],
    queryFn: centralizedPropertyService.getAllProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
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
    queryFn: () => propertyId ? centralizedPropertyService.getPropertyById(propertyId) : Promise.resolve(null),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    property,
    isLoading,
    error
  };
};
