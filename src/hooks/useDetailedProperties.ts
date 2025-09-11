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

export const useDetailedProperties = () => {
  const { data: properties, isLoading, error, refetch } = useQuery<PropertyListItem[], Error>({
    queryKey: ['detailed-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Transform database properties to PropertyListItem format
      const transformedProperties: PropertyListItem[] = (data || []).map(property => ({
        id: property.id,
        name: property.name,
        address: property.address || '',
        property_type: property.property_type || 'villa',
        status: property.status || 'active',
        room_status: 'ready', // Default room status since we don't have room status tracking yet
        num_bedrooms: property.num_bedrooms || 0,
        num_bathrooms: property.num_bathrooms || 0,
        hero_image: '/placeholder.svg', // Default placeholder until we implement image management
        open_issues_count: 0, // Will be calculated from actual tasks when implemented
        urgent_issues_count: 0, // Will be calculated from actual tasks when implemented
      }));
      
      return transformedProperties;
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
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Transform database property to DetailedProperty format
      const detailedProperty: DetailedProperty = {
        id: data.id,
        name: data.name,
        address: data.address || '',
        property_type: data.property_type || 'villa',
        status: (data.status || 'active') as any,
        room_status: 'ready' as any, // Default until we implement room status tracking
        num_bedrooms: data.num_bedrooms || 0,
        num_bathrooms: data.num_bathrooms || 0,
        max_guests: 4, // Default until we add this field to database
        square_feet: undefined, // Not in current database schema
        description: data.description || '',
        notes: data.notes || '',
        images: [
          {
            id: `${data.id}-img-1`,
            url: '/placeholder.svg',
            title: 'Main View',
            is_hero: true,
            order_index: 1
          }
        ],
        amenities: [], // Will be implemented when we add amenities table
        open_tasks: {
          housekeeping: 0,
          maintenance: 0,
          damage_reports: 0
        }, // Will be calculated from actual tasks
        financial_summary: {
          total_costs: 0,
          maintenance_costs: 0,
          damage_costs: 0,
          expense_distribution: {
            maintenance: 0,
            damages: 0
          }
        }, // Will be calculated from actual expenses
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        last_occupied: undefined, // Will be calculated from bookings
        next_checkin: undefined // Will be calculated from bookings
      };

      return detailedProperty;
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
      // Placeholder for amenities update
      console.log('Updating amenities:', amenityIds);
      return { success: true };
      console.log('Property amenities update requested:', { propertyId, amenityIds });
      toast({
        title: "Feature Coming Soon",
        description: "Property amenities management will be available soon.",
        variant: "default",
      });
      return amenityIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailed-property', propertyId] });
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