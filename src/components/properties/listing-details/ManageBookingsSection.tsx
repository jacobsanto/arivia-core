
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { 
  Calendar, 
  ClipboardList, 
  Broom, 
  Check, 
  Loader2
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/services/dataFormatService';
import { guestyService } from '@/services/guesty/guesty.service';
import { toast } from 'sonner';

interface BookingItemProps {
  booking: any;
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (bookingId: string) => void;
  isCleaningTriggered?: boolean;
}

const BookingItem: React.FC<BookingItemProps> = ({ 
  booking, 
  onTriggerCleaning, 
  onMarkCleaned,
  isCleaningTriggered = false 
}) => {
  // Format dates for display
  const checkInDate = formatDate(booking.check_in);
  const checkOutDate = formatDate(booking.check_out);
  
  // Determine status badge
  const getBadgeVariant = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'default';
      case 'canceled': case 'cancelled': return 'destructive';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-medium">{booking.guest_name || 'Guest'}</h3>
            <Badge variant={getBadgeVariant(booking.status)}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>Check-in: {checkInDate}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>Check-out: {checkOutDate}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {isCleaningTriggered ? (
              <Badge variant="outline" className="flex items-center bg-muted/20">
                <Check className="h-3 w-3 mr-1" />
                Cleaning Scheduled
              </Badge>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onTriggerCleaning(booking.id)}
                >
                  <Broom className="h-3.5 w-3.5 mr-1.5" />
                  Schedule Cleaning
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onMarkCleaned(booking.id)}
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Mark as Cleaned
                </Button>
              </>
            )}
            
            <Button 
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  
  // Filter bookings by upcoming and past
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
    // In a real implementation, this would call an API to schedule cleaning
    setTriggeredCleanings(prev => [...prev, bookingId]);
    toast.success("Cleaning scheduled", {
      description: "A cleaning task has been created"
    });
  };
  
  const handleMarkCleaned = (bookingId: string) => {
    // In a real implementation, this would call an API to mark as cleaned
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
      {/* Top Actions */}
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
      
      {/* Upcoming Bookings Section */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Bookings</h3>
          <div className="space-y-3">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <BookingItem 
                key={booking.id}
                booking={booking}
                onTriggerCleaning={handleTriggerCleaning}
                onMarkCleaned={handleMarkCleaned}
                isCleaningTriggered={triggeredCleanings.includes(booking.id)}
              />
            ))}
            
            {upcomingBookings.length > 3 && (
              <Button variant="ghost" className="w-full text-sm">
                View All {upcomingBookings.length} Upcoming Bookings
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Past Bookings Section */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Bookings</h3>
          <div className="space-y-3">
            {pastBookings.slice(0, 2).map((booking) => (
              <BookingItem 
                key={booking.id}
                booking={booking}
                onTriggerCleaning={handleTriggerCleaning}
                onMarkCleaned={handleMarkCleaned}
              />
            ))}
            
            {pastBookings.length > 2 && (
              <Button variant="ghost" className="w-full text-sm">
                View All {pastBookings.length} Past Bookings
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Empty State */}
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
