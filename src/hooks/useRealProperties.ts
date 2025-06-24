
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { centralizedPropertyService, PropertyOption } from '@/services/property/centralizedProperty.service';

export const useRealProperties = () => {
  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['real-properties'],
    queryFn: centralizedPropertyService.getAllProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    properties: properties || [],
    isLoading,
    error,
    refetch
  };
};

export const useRealProperty = (propertyId: string | null) => {
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['real-property', propertyId],
    queryFn: () => propertyId ? centralizedPropertyService.getPropertyById(propertyId) : null,
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    property,
    isLoading,
    error
  };
};
