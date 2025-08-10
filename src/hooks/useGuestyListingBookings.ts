
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuestyBooking {
  id: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  status: string | null;
  created_at?: string;
  updated_at?: string;
  raw_data?: any;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  upcomingBookings: number;
  cancelledBookings: number;
}

export function useGuestyListingBookings(listingId: string | undefined) {
  return useQuery({
    queryKey: ['guesty-listing-bookings', listingId],
    queryFn: async () => {
      if (!listingId) return { bookings: [], stats: getEmptyStats() };
      
      const { data, error } = await (supabase as any)
        .from('guesty_bookings')
        .select('*')
        .eq('listing_id', listingId)
        .order('check_in', { ascending: false });
        
      if (error) throw error;
      
      const bookings = data as GuestyBooking[];
      const stats = calculateBookingStats(bookings);
      
      return { bookings, stats };
    },
    enabled: !!listingId
  });
}

function getEmptyStats(): BookingStats {
  return {
    totalBookings: 0,
    confirmedBookings: 0,
    upcomingBookings: 0,
    cancelledBookings: 0
  };
}

function calculateBookingStats(bookings: GuestyBooking[]): BookingStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    upcomingBookings: bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      return checkIn >= today && b.status?.toLowerCase() === 'confirmed';
    }).length,
    cancelledBookings: bookings.filter(b => 
      b.status?.toLowerCase() === 'canceled' || b.status?.toLowerCase() === 'cancelled'
    ).length
  };
}
