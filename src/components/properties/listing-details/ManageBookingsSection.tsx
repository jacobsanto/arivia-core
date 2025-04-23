import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGuestyBookings } from "./useGuestyBookings";
import BookingsEmptyState from "./BookingsEmptyState";
import ManageBookingsHeader from "./ManageBookingsHeader";
import { ManageBookingsList } from "./ManageBookingsList";

interface ManageBookingsSectionProps {
  listing: any;
  isLoading: boolean;
}

const ManageBookingsSection: React.FC<ManageBookingsSectionProps> = ({
  listing,
  isLoading,
}) => {
  const { bookingsWithTasks, loading, error, refetch } = useGuestyBookings(listing?.id);

  const sortedBookingsWithTasks = bookingsWithTasks.slice().sort((a, b) =>
    new Date(a.booking.check_in).getTime() - new Date(b.booking.check_in).getTime()
  );

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
    // Remove Sync Bookings button as sync is automatic
    return (
      <BookingsEmptyState onSync={undefined} isSyncing={false} />
    );
  }

  return (
    <div className="space-y-6">
      <ManageBookingsHeader onSync={undefined} isSyncing={false} />
      <ManageBookingsList
        bookingsWithTasks={sortedBookingsWithTasks}
        onTriggerCleaning={handleTriggerCleaning}
        onMarkCleaned={handleMarkCleaned}
      />
    </div>
  );
};

export default ManageBookingsSection;
