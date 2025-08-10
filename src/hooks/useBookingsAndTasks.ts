import { useBookings } from './useBookings';

export interface BookingWithTask {
  booking: any;
  cleaningTask: any | null;
}

export interface UseBookingsAndTasksResult {
  bookingsWithTasks: BookingWithTask[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  syncBookings: () => Promise<void>;
  lastSynced: string | null;
}

export function useBookingsAndTasks(listingId?: string | number): UseBookingsAndTasksResult {
  const { bookings, isLoading, error, refreshBookings } = useBookings(String(listingId));

  const bookingsWithTasks: BookingWithTask[] = bookings.map(booking => ({
    booking,
    cleaningTask: null
  }));

  const syncBookings = async () => {
    await refreshBookings();
  };

  return {
    bookingsWithTasks,
    loading: isLoading,
    error: error ? new Error(error) : null,
    refetch: refreshBookings,
    syncBookings,
    lastSynced: null
  };
}