
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { guestyService } from '@/services/guesty/guesty.service';

export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  property_id: string;
}

// Define the Guesty booking type based on the actual table structure
interface GuestyBooking {
  id: string;
  guest_name: string;
  listing_id: string;
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_synced: string;
  raw_data: any;
}

export const useBookings = (propertyId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load bookings for the property
  const fetchBookings = async () => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching bookings for property ID: ${propertyId}`);
      
      // Detect if the property ID is from Guesty (non-UUID format)
      const isGuestyProperty = propertyId && 
        !propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      if (isGuestyProperty) {
        console.log(`Fetching Guesty bookings for listing: ${propertyId}`);
        // For Guesty properties, use the guesty_bookings table with listing_id filter
        const { data, error } = await supabase
          .from('guesty_bookings')
          .select('*')
          .eq('listing_id', propertyId);
        
        if (error) throw new Error(`Error fetching Guesty bookings: ${error.message}`);
        
        console.log(`Found ${data?.length || 0} Guesty bookings`);
        
        // Transform Guesty booking format to match our Booking interface
        const transformedBookings: Booking[] = (data as GuestyBooking[] || []).map(booking => {
          // Extract guest info and other details from raw_data if available
          const rawData = booking.raw_data || {};
          const guestData = rawData.guest || {};
          
          return {
            id: booking.id,
            guest_name: booking.guest_name || guestData.fullName || 'Guest',
            guest_email: guestData.email || 'email@example.com',
            guest_phone: guestData.phone,
            check_in_date: booking.check_in,
            check_out_date: booking.check_out,
            num_guests: rawData.guestsCount || 1,
            total_price: rawData.money?.netAmount || 0,
            status: booking.status || 'confirmed',
            created_at: booking.created_at || new Date().toISOString(),
            updated_at: booking.updated_at || booking.last_synced || new Date().toISOString(),
            property_id: booking.listing_id
          };
        });
        
        setBookings(transformedBookings);
      } else {
        // For regular properties, use the bookings table with proper UUID property_id filter
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', propertyId);
        
        if (error) throw new Error(`Error fetching regular bookings: ${error.message}`);
        
        setBookings(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
      toastService.error('Failed to load bookings', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sync bookings with Guesty
  const syncBookings = async () => {
    if (!propertyId) return;

    // Check if it's a Guesty property
    const isGuestyProperty = propertyId && 
      !propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    if (!isGuestyProperty) {
      toastService.info('Not a Guesty property', {
        description: 'Only Guesty properties can be synced'
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsForListing(propertyId);
      
      if (result.success) {
        toastService.success('Bookings synced successfully', {
          description: `Synced ${result.bookingsSynced} bookings`
        });
        // Refresh bookings list
        fetchBookings();
      } else {
        toastService.error('Failed to sync bookings', {
          description: result.message || 'Unknown error'
        });
      }
    } catch (err: any) {
      console.error('Error syncing bookings:', err);
      toastService.error('Failed to sync bookings', {
        description: err.message || 'An error occurred while syncing bookings'
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  useEffect(() => {
    if (propertyId) {
      fetchBookings();
    } else {
      setBookings([]);
      setIsLoading(false);
    }
  }, [propertyId]);

  return {
    bookings,
    isLoading,
    error,
    isSyncing,
    syncBookings,
    refreshBookings: fetchBookings
  };
};
