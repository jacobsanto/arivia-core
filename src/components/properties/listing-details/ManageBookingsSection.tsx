import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { guestyService } from "@/services/guesty/guesty.service";
import { useBookingsWithTasks } from "./useBookingsWithTasks";
import BookingsEmptyState from "./BookingsEmptyState";
import ManageBookingsHeader from "./ManageBookingsHeader";
import ManageBookingsList from "./ManageBookingsList";

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

  const { bookingsWithTasks, loading, error } = useBookingsWithTasks(listing?.id);

  const sortedBookingsWithTasks = bookingsWithTasks
    .slice()
    .sort((a, b) =>
      new Date(a.booking.check_in).getTime() - new Date(b.booking.check_in).getTime()
    );

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    try {
      const result = await import("@/services/guesty/guesty.service").then(m =>
        m.guestyService.syncBookingsForListing(listing.id)
      );
      if (result.success) {
        toast.success("Bookings synced successfully", {
          description: `${result.bookingsSynced} bookings updated`,
        });
      } else {
        toast.error("Failed to sync bookings", {
          description: result.message,
        });
      }
    } catch (error: any) {
      toast.error("Sync error", { description: error.message || "Could not sync bookings" });
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
