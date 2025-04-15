
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useBookings } from "./useBookings";

interface BookingCalendarViewProps {
  propertyId: string;
  selectedDate: Date | undefined;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export const BookingCalendarView = ({ 
  propertyId, 
  selectedDate, 
  setSelectedDate 
}: BookingCalendarViewProps) => {
  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = useState(false);
  const { bookings } = useBookings(propertyId);

  // Calculate calendar day class names based on bookings
  const getBookedDaysModifiers = () => {
    const bookedDays: Date[] = [];
    
    bookings.forEach(booking => {
      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);
      
      // Add all dates between check-in and check-out to the bookedDays array
      const currentDate = new Date(checkInDate);
      while (currentDate <= checkOutDate) {
        bookedDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return bookedDays;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Calendar</span>
          <Dialog open={isAddBookingDialogOpen} onOpenChange={setIsAddBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Booking</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Booking form would go here in a real implementation.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiersClassNames={{
            selected: 'bg-primary text-primary-foreground',
            booked: 'bg-blue-100 text-blue-900 rounded-md'
          }}
          modifiers={{
            booked: getBookedDaysModifiers()
          }}
        />
      </CardContent>
    </Card>
  );
};
