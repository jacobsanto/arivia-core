
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { guestyService } from '@/services/guesty/guesty.service';
import { BookingsListSection } from './BookingsListSection';

interface ManageBookingsSectionProps {
  listing: any;
  bookings: any[];
  isLoading: boolean;
}

const ManageBookingsSection: React.FC<ManageBookingsSectionProps> = ({
  listing,
  bookings,
  isLoading
}) => {
  const [triggeredCleanings, setTriggeredCleanings] = React.useState<string[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const today = new Date();
  const upcomingBookings = bookings
    .filter(booking => new Date(booking.check_in) >= today)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());

  const pastBookings = bookings
    .filter(booking => new Date(booking.check_out) < today)
    .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsForListing(listing.id);
      if (result.success) {
        toast.success("Bookings synced successfully", {
          description: `${result.bookingsSynced} bookings updated`
        });
      } else {
        toast.error("Failed to sync bookings", {
          description: result.message
        });
      }
    } catch (error: any) {
      toast.error("An error occurred", {
        description: error.message || "Could not sync bookings"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerCleaning = (bookingId: string) => {
    setTriggeredCleanings(prev => [...prev, bookingId]);
    toast.success("Cleaning scheduled", {
      description: "A cleaning task has been created"
    });
  };

  const handleMarkCleaned = (bookingId: string) => {
    setTriggeredCleanings(prev => [...prev, bookingId]);
    toast.success("Marked as cleaned", {
      description: "The property has been marked as cleaned"
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Button
          onClick={handleSyncBookings}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Sync Bookings
            </>
          )}
        </Button>
      </div>

      {upcomingBookings.length > 0 && (
        <BookingsListSection
          title="Upcoming Bookings"
          bookings={upcomingBookings}
          maxToShow={3}
          showViewAll={upcomingBookings.length > 3}
          viewAllLabel={`View All ${upcomingBookings.length} Upcoming Bookings`}
          onTriggerCleaning={handleTriggerCleaning}
          onMarkCleaned={handleMarkCleaned}
          triggeredCleanings={triggeredCleanings}
        />
      )}

      {pastBookings.length > 0 && (
        <BookingsListSection
          title="Past Bookings"
          bookings={pastBookings}
          maxToShow={2}
          showViewAll={pastBookings.length > 2}
          viewAllLabel={`View All ${pastBookings.length} Past Bookings`}
          onTriggerCleaning={handleTriggerCleaning}
          onMarkCleaned={handleMarkCleaned}
          triggeredCleanings={triggeredCleanings}
        />
      )}

      {bookings.length === 0 && (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No Bookings Found</h3>
            <p className="text-muted-foreground mb-4">
              This property doesn't have any bookings yet.
            </p>
            <Button onClick={handleSyncBookings} disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : 'Sync with Guesty'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageBookingsSection;
