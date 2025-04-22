
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { guestyService } from "@/services/guesty/guesty.service";
import BookingsListWrapper from "./BookingsListWrapper";
import BookingsEmptyState from "./BookingsEmptyState";
import ManageBookingsHeader from "./ManageBookingsHeader";

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
  const [triggeredCleanings, setTriggeredCleanings] = React.useState<string[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const today = new Date();
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.check_in) >= today)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());

  const pastBookings = bookings
    .filter((booking) => new Date(booking.check_out) < today)
    .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsForListing(listing.id);
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
      toast.error("An error occurred", {
        description: error.message || "Could not sync bookings",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerCleaning = (bookingId: string) => {
    setTriggeredCleanings((prev) => [...prev, bookingId]);
    toast.success("Cleaning scheduled", {
      description: "A cleaning task has been created",
    });
  };

  const handleMarkCleaned = (bookingId: string) => {
    setTriggeredCleanings((prev) => [...prev, bookingId]);
    toast.success("Marked as cleaned", {
      description: "The property has been marked as cleaned",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManageBookingsHeader onSync={handleSyncBookings} isSyncing={isSyncing} />

      {upcomingBookings.length > 0 && (
        <BookingsListWrapper
          type="upcoming"
          bookings={upcomingBookings}
          maxToShow={3}
          onTriggerCleaning={handleTriggerCleaning}
          onMarkCleaned={handleMarkCleaned}
          triggeredCleanings={triggeredCleanings}
        />
      )}

      {pastBookings.length > 0 && (
        <BookingsListWrapper
          type="past"
          bookings={pastBookings}
          maxToShow={2}
          onTriggerCleaning={handleTriggerCleaning}
          onMarkCleaned={handleMarkCleaned}
          triggeredCleanings={triggeredCleanings}
        />
      )}

      {bookings.length === 0 && (
        <BookingsEmptyState onSync={handleSyncBookings} isSyncing={isSyncing} />
      )}
    </div>
  );
};

export default ManageBookingsSection;
