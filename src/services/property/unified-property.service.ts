
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { UnifiedProperty } from '@/types/property.types';
import { guestyService } from '../guesty/guesty.service';
import { SortOption } from '@/components/properties/PropertySort';

export const unifiedPropertyService = {
  async fetchAllProperties(sortOption?: SortOption, searchQuery?: string): Promise<UnifiedProperty[]> {
    try {
      let query = supabase
        .from('guesty_listings')
        .select(`
          *,
          next_booking:guesty_bookings(
            check_in,
            status
          ),
          housekeeping_tasks!housekeeping_tasks_listing_id_fkey(
            id,
            status
          )
        `)
        .eq('is_deleted', false)
        .gte('next_booking.check_in', new Date().toISOString().split('T')[0])
        .neq('next_booking.status', 'cancelled')
        .order('check_in', { ascending: true, foreignTable: 'next_booking' });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,address->full.ilike.%${searchQuery}%`);
      }

      if (sortOption) {
        query = query.order(sortOption.column, {
          ascending: sortOption.ascending
        });
      } else {
        query = query.order('title');
      }

      const { data: guestyListings, error: guestyError } = await query;

      if (guestyError) throw guestyError;

      const guestyProperties = (guestyListings || []).map(listing => {
        const nextBooking = listing.next_booking?.[0];
        const hasActiveTasks = listing.housekeeping_tasks?.some(
          (task: any) => task.status === 'pending' || task.status === 'in-progress'
        );
        
        return {
          ...this.transformGuestyToUnified(listing),
          next_check_in: nextBooking?.check_in || null,
          has_active_cleaning: hasActiveTasks || false
        };
      });

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
      status: listing.status || 'Unknown',
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
      // For Guesty properties, use the listing_id field
      const { data, error } = await supabase
        .from('guesty_bookings')
        .select('*')
        .eq('listing_id', propertyId);

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
