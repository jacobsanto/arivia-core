
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, RefreshCcw } from "lucide-react";
import BookingsList from "./BookingsList";
import { useBookings } from "@/hooks/useBookings";
import { Property } from "@/types/property.types";

interface BookingCalendarProps {
  property: Property;
  onBack: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ property, onBack }) => {
  const { 
    bookings, 
    isLoading, 
    isSyncing, 
    syncBookings, 
    refreshBookings 
  } = useBookings(property.id);

  // Check if this is a Guesty property (non-UUID format)
  const isGuestyProperty = property.id && 
    !property.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} size="sm">
              Back
            </Button>
            <h1 className="text-xl font-bold">Bookings - {property.name}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{property.address}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshBookings}
            disabled={isLoading}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {isGuestyProperty && (
            <Button 
              onClick={syncBookings}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Sync with Guesty
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <BookingsList bookings={bookings} isLoading={isLoading} />
    </div>
  );
};

export default BookingCalendar;
