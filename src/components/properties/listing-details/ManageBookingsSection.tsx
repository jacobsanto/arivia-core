
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBookingsAndTasks } from '@/hooks/useBookingsAndTasks';
import BookingsEmptyState from "./BookingsEmptyState";
import ManageBookingsHeader from "./ManageBookingsHeader";
import { ManageBookingsList } from "./ManageBookingsList";
import { BookingSyncStatus } from "./BookingSyncStatus";
import { useBookingSync } from "@/hooks/useBookingSync";

interface ManageBookingsSectionProps {
  listing: any;
  isLoading: boolean;
}

const ManageBookingsSection: React.FC<ManageBookingsSectionProps> = ({
  listing,
  isLoading,
}) => {
  const { bookingsWithTasks, loading, error, refetch, lastSynced } = useBookingsAndTasks(listing?.id);
  const { isSyncing, syncBookingsForListing } = useBookingSync({
    onSyncComplete: refetch
  });

  // Sort bookings by check-in date
  const sortedBookingsWithTasks = bookingsWithTasks.slice().sort((a, b) =>
    new Date(a.booking.check_in_date).getTime() - new Date(b.booking.check_in_date).getTime()
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
    return (
      <BookingsEmptyState 
        onSync={() => syncBookingsForListing(listing.id)} 
        isSyncing={isSyncing} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">Bookings</h3>
          <p className="text-sm text-muted-foreground">
            {sortedBookingsWithTasks.length} booking{sortedBookingsWithTasks.length !== 1 ? 's' : ''} found
          </p>
          <BookingSyncStatus lastSynced={lastSynced} />
        </div>
        <ManageBookingsHeader
          listingId={listing.id}
          onSyncComplete={refetch}
        />
      </div>
      
      <ManageBookingsList
        bookingsWithTasks={sortedBookingsWithTasks}
        onTriggerCleaning={handleTriggerCleaning}
        onMarkCleaned={handleMarkCleaned}
      />
    </div>
  );
};

export default ManageBookingsSection;
