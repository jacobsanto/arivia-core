
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { unifiedPropertyService } from "@/services/property/unified-property.service";
import type { Property } from "@/types/property.types";

interface BookingStatusContentProps {
  property: Property;
}

const BookingStatusContent = ({ property }: BookingStatusContentProps) => {
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await unifiedPropertyService.getPropertyBookings(property.id);
        
        const today = new Date();
        
        // Detect if the property ID is from Guesty (non-UUID format)
        const isGuestyProperty = property.id && 
          !property.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        
        if (isGuestyProperty) {
          // Handle Guesty bookings
          const current = bookings.find(booking => 
            new Date(booking.check_in) <= today && 
            new Date(booking.check_out) >= today
          );
          setCurrentBooking(current || null);
          
          const upcoming = bookings
            .filter(booking => new Date(booking.check_in) > today)
            .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())[0];
          setNextBooking(upcoming || null);
        } else {
          // Handle regular bookings
          const current = bookings.find(booking => 
            new Date(booking.check_in_date) <= today && 
            new Date(booking.check_out_date) >= today
          );
          setCurrentBooking(current || null);
          
          const upcoming = bookings
            .filter(booking => new Date(booking.check_in_date) > today)
            .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
          setNextBooking(upcoming || null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setIsLoading(false);
      }
    };
    
    if (property.id) {
      fetchBookings();
    }
  }, [property.id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/4" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        <p>Error loading booking information</p>
        <p>{error}</p>
      </div>
    );
  }

  // Helper function to get dates accounting for different field names
  const getDateDisplay = (booking: any) => {
    const checkInDate = booking.check_in_date || booking.check_in;
    const checkOutDate = booking.check_out_date || booking.check_out;
    
    return `${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()}`;
  };

  return (
    <>
      {currentBooking ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Guests</h3>
            <p>{currentBooking.guest_name}</p>
            <div className="text-sm text-muted-foreground">
              {getDateDisplay(currentBooking)}
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm" className="mr-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Guests
            </Button>
          </div>
        </div>
      ) : nextBooking ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Next Booking</h3>
            <p>{nextBooking.guest_name}</p>
            <div className="text-sm text-muted-foreground">
              {getDateDisplay(nextBooking)}
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm">Prepare Welcome Package</Button>
          </div>
        </div>
      ) : (
        <div>
          <p>No current or upcoming bookings.</p>
          <Button className="mt-4" size="sm" variant="outline">Create Booking</Button>
        </div>
      )}
    </>
  );
};

export default BookingStatusContent;
