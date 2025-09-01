import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  DetailedProperty, 
  PropertyListItem, 
  PropertyFilters, 
  PropertyViewMode,
  PropertyAmenity 
} from '@/types/property-detailed.types';

// Mock data generator for development
const generateMockProperty = (id: string): DetailedProperty => ({
  id,
  name: `Villa ${id.slice(0, 8)}`,
  address: `${Math.floor(Math.random() * 999) + 1} Seaside Avenue, Mykonos`,
  property_type: ['villa', 'apartment', 'house'][Math.floor(Math.random() * 3)],
  status: ['occupied', 'vacant', 'maintenance'][Math.floor(Math.random() * 3)] as any,
  room_status: ['dirty', 'cleaning', 'cleaned', 'inspected', 'ready'][Math.floor(Math.random() * 5)] as any,
  num_bedrooms: Math.floor(Math.random() * 4) + 1,
  num_bathrooms: Math.floor(Math.random() * 3) + 1,
  max_guests: Math.floor(Math.random() * 8) + 2,
  square_feet: Math.floor(Math.random() * 2000) + 800,
  description: `Beautiful ${['modern', 'traditional', 'luxury', 'cozy'][Math.floor(Math.random() * 4)]} property with stunning views and premium amenities. Perfect for families and groups looking for an unforgettable experience.`,
  notes: Math.random() > 0.5 ? 'Gate code: 1234. Wifi password: villa2024. Pool heating available.' : '',
  images: [
    {
      id: `${id}-img-1`,
      url: '/placeholder.svg',
      title: 'Main View',
      is_hero: true,
      order_index: 1
    },
    {
      id: `${id}-img-2`,
      url: '/placeholder.svg',
      title: 'Pool Area',
      is_hero: false,
      order_index: 2
    }
  ],
  amenities: [],
  open_tasks: {
    housekeeping: Math.floor(Math.random() * 5),
    maintenance: Math.floor(Math.random() * 3),
    damage_reports: Math.floor(Math.random() * 2)
  },
  financial_summary: {
    total_costs: Math.floor(Math.random() * 5000) + 1000,
    maintenance_costs: Math.floor(Math.random() * 3000) + 500,
    damage_costs: Math.floor(Math.random() * 2000) + 200,
    expense_distribution: {
      maintenance: Math.floor(Math.random() * 70) + 20,
      damages: Math.floor(Math.random() * 30) + 10
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_occupied: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  next_checkin: Math.random() > 0.4 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined
});

export const useDetailedProperties = () => {
  const { data: properties, isLoading, error, refetch } = useQuery<PropertyListItem[], Error>({
    queryKey: ['detailed-properties'],
    queryFn: async () => {
      // For now, generate mock data
      // In production, this would be a real Supabase query
      const mockProperties: PropertyListItem[] = Array.from({ length: 12 }, (_, i) => {
        const fullProperty = generateMockProperty(`prop-${i + 1}`);
        return {
          id: fullProperty.id,
          name: fullProperty.name,
          address: fullProperty.address,
          property_type: fullProperty.property_type,
          status: fullProperty.status,
          room_status: fullProperty.room_status,
          num_bedrooms: fullProperty.num_bedrooms,
          num_bathrooms: fullProperty.num_bathrooms,
          hero_image: fullProperty.images.find(img => img.is_hero)?.url,
          open_issues_count: fullProperty.open_tasks.housekeeping + fullProperty.open_tasks.maintenance + fullProperty.open_tasks.damage_reports,
          urgent_issues_count: Math.floor(Math.random() * 3)
        };
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockProperties;
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

export const useDetailedProperty = (propertyId: string | null) => {
  const { data: property, isLoading, error } = useQuery<DetailedProperty | null, Error>({
    queryKey: ['detailed-property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      // For now, generate mock data
      // In production, this would be a real Supabase query
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateMockProperty(propertyId);
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

export const usePropertyFiltering = () => {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    status: 'all',
    room_status: 'all',
    property_type: 'all',
    bedrooms: 'all',
    has_issues: false
  });

  const [viewMode, setViewMode] = useState<PropertyViewMode>({
    mode: 'grid',
    sort_by: 'name',
    sort_direction: 'asc'
  });

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateViewMode = (update: Partial<PropertyViewMode>) => {
    setViewMode(prev => ({ ...prev, ...update }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      room_status: 'all',
      property_type: 'all',
      bedrooms: 'all',
      has_issues: false
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.room_status !== 'all') count++;
    if (filters.property_type !== 'all') count++;
    if (filters.bedrooms !== 'all') count++;
    if (filters.has_issues) count++;
    return count;
  }, [filters]);

  return {
    filters,
    viewMode,
    updateFilter,
    updateViewMode,
    clearFilters,
    activeFiltersCount
  };
};

export const usePropertyAmenities = (propertyId: string) => {
  const queryClient = useQueryClient();

  const updateAmenities = useMutation({
    mutationFn: async (amenityIds: string[]) => {
      // For now, just simulate the update
      // In production, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      return amenityIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailed-property', propertyId] });
      toast({
        title: "Amenities updated",
        description: "Property amenities have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update amenities. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    updateAmenities: updateAmenities.mutate,
    isUpdating: updateAmenities.isPending
  };
};