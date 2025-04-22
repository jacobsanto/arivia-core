
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';

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

export const useBookings = (propertyId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookings for the property
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // Detect if the property ID is from Guesty (non-UUID format)
        const isGuestyProperty = propertyId && 
          !propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        if (isGuestyProperty) {
          // For Guesty properties, use the guesty_bookings table
          const { data, error } = await supabase
            .from('guesty_bookings')
            .select('*')
            .eq('listing_id', propertyId);
          
          if (error) throw new Error(error.message);
          
          // Transform Guesty booking format to match our Booking interface
          const transformedBookings: Booking[] = (data || []).map(booking => ({
            id: booking.id,
            guest_name: booking.guest_name || 'Guest',
            guest_email: booking.guest_email || 'email@example.com',
            guest_phone: booking.guest_phone,
            check_in_date: booking.check_in,
            check_out_date: booking.check_out,
            num_guests: booking.num_guests || 1,
            total_price: booking.total_price || 0,
            status: booking.status || 'confirmed',
            created_at: booking.created_at,
            updated_at: booking.updated_at || booking.created_at,
            property_id: booking.listing_id
          }));
          
          setBookings(transformedBookings);
        } else {
          // For regular properties, use the bookings table
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('property_id', propertyId);
          
          if (error) throw new Error(error.message);
          
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
    
    if (propertyId) {
      fetchBookings();
    }
  }, [propertyId]);

  return {
    bookings,
    isLoading,
    error
  };
};
