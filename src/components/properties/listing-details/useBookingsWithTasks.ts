import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BookingWithTask {
  booking: any;
  cleaningTask: any | null;
}

export function useBookingsWithTasks(listingId: string | number | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingsWithTasks, setBookingsWithTasks] = useState<BookingWithTask[]>([]);

  useEffect(() => {
    if (!listingId) return;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch all bookings for property
        const { data: bookings, error: bookingError } = await supabase
          .from("guesty_bookings")
          .select("*")
          .eq("listing_id", listingId)
          .order("check_in", { ascending: true });
        if (bookingError) throw bookingError;

        // 2. Fetch all housekeeping tasks for this property
        const { data: tasks, error: taskError } = await supabase
          .from("housekeeping_tasks")
          .select("*")
          .eq("listing_id", listingId);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [listingId]);

  return { bookingsWithTasks, loading, error };
}
