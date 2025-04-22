
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { UnifiedProperty } from '@/types/property.types';
import { guestyService } from '../guesty/guesty.service';
import { SortOption } from '@/components/properties/PropertySort';

export const unifiedPropertyService = {
  async fetchAllProperties(sortOption?: SortOption): Promise<UnifiedProperty[]> {
    try {
      let query = supabase
        .from('guesty_listings')
        .select('*')
        .eq('is_deleted', false);

      if (sortOption) {
        query = query.order(sortOption.column, {
          ascending: sortOption.ascending
        });
      } else {
        query = query.order('title');
      }

      const { data: guestyListings, error: guestyError } = await query;

      if (guestyError) throw guestyError;

      const guestyProperties = (guestyListings || []).map(listing => this.transformGuestyToUnified(listing));

      return guestyProperties;
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      toastService.error('Failed to fetch properties', {
        description: err.message
      });
      return [];
    }
  },

  transformGuestyToUnified(listing: any): UnifiedProperty {
    // Extract address components
    const address = typeof listing.address === 'object' ? listing.address : {};
    const fullAddress = address.full || '';
    const location = address.city || address.country || 'Greece';
    
    // Determine status 
    let status = 'Vacant';
    if (listing.status === 'active') {
      status = 'Vacant'; // Default for active
    } else if (listing.status === 'inactive' || listing.sync_status === 'archived') {
      status = 'Maintenance';
    }

    // Extract property details from raw_data if available
    const rawData = listing.raw_data || {};
    const bedrooms = rawData.bedrooms || 0;
    const bathrooms = rawData.bathrooms || 0;
    const price = rawData.basePrice || 0;
    const maxGuests = rawData.accommodates || 0;
    
    return {
      id: listing.id,
      name: listing.title,
      location: location,
      status: status,
      type: listing.property_type || 'Luxury Villa',
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      price: price,
      price_per_night: price,
      imageUrl: listing.thumbnail_url || '/placeholder.svg',
      description: rawData.description || '',
      address: fullAddress,
      max_guests: maxGuests,
      created_at: listing.created_at || new Date().toISOString(),
      updated_at: listing.updated_at || new Date().toISOString(),
      source: 'guesty',
      guesty_id: listing.id,
      last_synced: listing.last_synced
    };
  },

  async syncGuestyProperties(): Promise<{ success: boolean; message: string }> {
    try {
      await guestyService.syncListings();
      return { 
        success: true, 
        message: 'Properties successfully synced with Guesty' 
      };
    } catch (err: any) {
      console.error('Error syncing properties:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to sync properties' 
      };
    }
  },

  async getPropertyBookings(propertyId: string): Promise<any[]> {
    try {
      // Check if the property ID is from Guesty (non-UUID format)
      const isGuestyProperty = propertyId && 
        !propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      if (isGuestyProperty) {
        console.log(`Fetching Guesty bookings for listing: ${propertyId}`);
        // For Guesty properties, use the listing_id field
        const { data, error } = await supabase
          .from('guesty_bookings')
          .select('*')
          .eq('listing_id', propertyId);

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      } else {
        // For regular properties, use the property_id field
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', propertyId);

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      }
    } catch (err: any) {
      console.error('Error fetching property bookings:', err);
      toastService.error('Failed to fetch bookings', {
        description: err.message
      });
      return [];
    }
  }
};
