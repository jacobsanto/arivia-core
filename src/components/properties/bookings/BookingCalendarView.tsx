
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
import BookingForm from "../booking-form";

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

  const getBookedDaysModifiers = () => {
    const bookedDays: Date[] = [];
    
    bookings.forEach(booking => {
      try {
        const checkInDate = new Date(booking.check_in_date);
        const checkOutDate = new Date(booking.check_out_date);
        
        // Skip invalid dates
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          console.warn("Invalid booking dates detected:", booking);
          return;
        }
        
        const currentDate = new Date(checkInDate);
        while (currentDate <= checkOutDate) {
          bookedDays.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error("Error processing booking dates:", error);
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
                <BookingForm 
                  propertyId={propertyId} 
                  onSuccess={() => setIsAddBookingDialogOpen(false)} 
                />
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
