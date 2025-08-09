
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, RefreshCcw } from "lucide-react";
import { BookingsList } from "./BookingsList";
import { useBookings } from "@/hooks/useBookings";
import { Property } from "@/types/property.types";
import { toast } from "sonner";

interface BookingCalendarProps {
  property: Property;
  onBack: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ property, onBack }) => {
  const { 
    bookings, 
    isLoading, 
    error,
    refreshBookings 
  } = useBookings(property.id);


  const handleRefresh = async () => {
    await refreshBookings();
    toast.success("Bookings refreshed");
  };

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
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 border rounded-md bg-red-50 border-red-200">
          <p className="text-lg font-medium text-red-700">Error loading bookings</p>
          <p className="text-muted-foreground text-red-600">{error}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-lg font-medium">No bookings found</p>
          <p className="text-muted-foreground">
            Add bookings using the button above
          </p>
        </div>
      ) : (
        <BookingsList bookings={bookings} isLoading={isLoading} />
      )}
    </div>
  );
};

export default BookingCalendar;
