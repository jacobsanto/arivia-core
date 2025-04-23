
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuestyBooking {
  id: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  status: string | null;
  raw_data?: any;
}

export function useGuestyListingBookings(listingId: string | undefined) {
  return useQuery({
    queryKey: ['guesty-listing-bookings', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      
      const { data, error } = await supabase
        .from('guesty_bookings')
        .select('*')
        .eq('listing_id', listingId)
        .order('check_in', { ascending: false });
        
      if (error) throw error;
      return data as GuestyBooking[];
    },
    enabled: !!listingId
  });
}
