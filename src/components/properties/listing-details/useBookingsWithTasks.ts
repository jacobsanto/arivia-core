import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BookingWithTask {
  booking: any;
  cleaningTask: any | null;
}

export function useBookingsWithTasks(listingId: string | number | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [bookingsWithTasks, setBookingsWithTasks] = useState<BookingWithTask[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!listingId) {
        setLoading(false);
        return;
      }
      
      // Convert listingId to string if it's a number to satisfy TypeScript
      const listingIdStr = String(listingId);
      
      // 1. Fetch all bookings for property
      const { data: bookings, error: bookingError } = await supabase
        .from("guesty_bookings")
        .select("*")
        .eq("listing_id", listingIdStr)
        .order("check_in", { ascending: true });
      if (bookingError) throw bookingError;

      // 2. Fetch all housekeeping tasks for this property
      const { data: tasks, error: taskError } = await supabase
        .from("housekeeping_tasks")
        .select("*")
        .eq("listing_id", listingIdStr);
      if (taskError) throw taskError;

      // 3. For each booking, find its related task (by booking_id)
      const records: BookingWithTask[] = (bookings || []).map((booking: any) => {
        const cleaningTask = (tasks || []).find(
          (task: any) => task.booking_id === booking.id
        );
        return { booking, cleaningTask: cleaningTask || null };
      });

      setBookingsWithTasks(records);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [listingId]);

  return { 
    bookingsWithTasks, 
    loading, 
    error, 
    refetch: fetchAll 
  };
}
