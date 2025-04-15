
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
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', propertyId);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setBookings(data || []);
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
