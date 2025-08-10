
// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { guestyService } from "@/services/guesty/guesty.service";

// Improved types for Guesty bookings with task and listing context
export interface GuestyBookingDb {
  id: string;
  listing_id: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  status: string | null;
  raw_data?: Json; // Changed from Record<string, any> to Json
  created_at?: string;
  updated_at?: string;
  last_synced?: string;
  webhook_updated?: boolean;
}

export interface CleaningTaskDb {
  id: string;
  status: string;
  task_type: string;
  due_date: string;
  booking_id: string;
  listing_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingWithTask {
  booking: GuestyBookingDb;
  cleaningTask: CleaningTaskDb | null;
}

interface UseGuestyBookingsResult {
  bookingsWithTasks: BookingWithTask[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  syncBookings: () => Promise<void>;
  lastSynced: string | null;
}

export function useGuestyBookings(listingId?: string | number): UseGuestyBookingsResult {
  const [bookingsWithTasks, setBookingsWithTasks] = useState<BookingWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!listingId) {
        setBookingsWithTasks([]);
        setLoading(false);
        return;
      }

      const listingIdStr = String(listingId);

      // Get bookings for this listing (sorted by check_in)
      const { data: bookings, error: bookingError } = await supabase
        .from("guesty_bookings")
        .select("*")
        .eq("listing_id", listingIdStr)
        .order("check_in", { ascending: true });

      if (bookingError) throw bookingError;

      // Get related housekeeping tasks for this listing
      const { data: tasks, error: taskError } = await supabase
        .from("housekeeping_tasks")
        .select("*")
        .eq("listing_id", listingIdStr);
      if (taskError) throw taskError;

      // Find last synced timestamp
      if (bookings && bookings.length > 0) {
        // Find the most recent last_synced timestamp
        const latestSync = bookings.reduce((latest, booking) => {
          if (!booking.last_synced) return latest;
          if (!latest || new Date(booking.last_synced) > new Date(latest)) {
            return booking.last_synced;
          }
          return latest;
        }, null as string | null);
        
        setLastSynced(latestSync);
      } else {
        setLastSynced(null);
      }

      // For each booking, attach any task where booking_id matches
      const result: BookingWithTask[] = (bookings || []).map((booking: any) => {
        const cleaningTask = (tasks || []).find(
          (task: any) => task.booking_id === booking.id
        ) as CleaningTaskDb | undefined;
        return {
          booking: booking as GuestyBookingDb,
          cleaningTask: cleaningTask || null
        };
      });

      setBookingsWithTasks(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Manually trigger a sync for this specific listing
  const syncBookings = async () => {
    if (!listingId) return;
    
    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsForListing(String(listingId));
      
      if (result.success) {
        toast.success("Bookings synchronized", {
          description: `Successfully synchronized ${result.bookingsSynced} bookings`
        });
        // Refetch to get the updated data
        await fetchAll();
      } else {
        toast.error("Sync failed", {
          description: result.error || "Unknown error occurred"
        });
      }
    } catch (err: any) {
      toast.error("Sync error", { 
        description: err.message || "Failed to sync bookings" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [listingId]);

  return {
    bookingsWithTasks,
    loading: loading || isSyncing,
    error,
    refetch: fetchAll,
    syncBookings,
    lastSynced
  };
}
