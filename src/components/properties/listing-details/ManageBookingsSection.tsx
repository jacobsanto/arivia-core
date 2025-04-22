
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { guestyService } from "@/services/guesty/guesty.service";
import { useBookingsWithTasks } from "./useBookingsWithTasks";
import BookingsEmptyState from "./BookingsEmptyState";
import ManageBookingsHeader from "./ManageBookingsHeader";
import { ManageBookingsList } from "./ManageBookingsList";

interface ManageBookingsSectionProps {
  listing: any;
  bookings: any[];
  isLoading: boolean;
}

const ManageBookingsSection: React.FC<ManageBookingsSectionProps> = ({
  listing,
  bookings,
  isLoading,
}) => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const { bookingsWithTasks, loading, error, refetch } = useBookingsWithTasks(listing?.id);

  const sortedBookingsWithTasks = bookingsWithTasks
    .slice()
    .sort((a, b) =>
      new Date(a.booking.check_in).getTime() - new Date(b.booking.check_in).getTime()
    );

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    try {
      const toastId = toast.loading("Syncing bookings...", {
        description: "Fetching current bookings from Guesty"
      });
      
      const result = await guestyService.syncBookingsForListing(listing.id);
      
      if (result.success) {
        toast.success("Bookings synced successfully", {
          id: toastId,
          description: `${result.bookingsSynced} bookings updated`,
        });
        // Refresh the bookings data
        refetch();
      } else {
        toast.error("Failed to sync bookings", {
          id: toastId,
          description: result.error || "Could not sync with Guesty",
        });
      }
    } catch (error: any) {
      toast.error("Sync error", { 
        description: error.message || "Could not sync bookings" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerCleaning = async (bookingId: string) => {
    try {
      const { data, error } = await import("@/integrations/supabase/client").then(({ supabase }) =>
        supabase
          .from("housekeeping_tasks")
          .insert([
            {
              status: "pending",
              task_type: "Departure Cleaning",
              listing_id: listing.id,
              booking_id: bookingId,
              due_date: new Date().toISOString().slice(0, 10),
            },
          ])
      );
      if (error) throw error;
      toast.success("Cleaning task scheduled", {
        description: "A cleaning task has been created.",
      });
      
      // Refresh the data to show the new task
      refetch();
    } catch (error: any) {
      toast.error("Could not schedule cleaning", {
        description: error.message,
      });
    }
  };

  const handleMarkCleaned = async (taskId: string) => {
    try {
      const { error } = await import("@/integrations/supabase/client").then(({ supabase }) =>
        supabase.from("housekeeping_tasks").update({ status: "done" }).eq("id", taskId)
      );
      if (error) throw error;
      toast.success("Marked as cleaned", {
        description: "The cleaning task for this booking is marked done.",
      });
      
      // Refresh the data to reflect the updated task status
      refetch();
    } catch (error: any) {
      toast.error("Could not mark as cleaned", {
        description: error.message,
      });
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error loading bookings: {error.message}</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  if (sortedBookingsWithTasks.length === 0) {
    return (
      <BookingsEmptyState onSync={handleSyncBookings} isSyncing={isSyncing} />
    );
  }

  return (
    <div className="space-y-6">
      <ManageBookingsHeader onSync={handleSyncBookings} isSyncing={isSyncing} />
      <ManageBookingsList
        bookingsWithTasks={sortedBookingsWithTasks}
        onTriggerCleaning={handleTriggerCleaning}
        onMarkCleaned={handleMarkCleaned}
      />
    </div>
  );
};

export default ManageBookingsSection;
