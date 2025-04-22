
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AddBookingDialog } from "./components/AddBookingDialog";
import { useBookedDates } from "./hooks/useBookedDates";

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
  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = useState<boolean>(false);
  const bookedDays = useBookedDates(propertyId);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Calendar</span>
          <AddBookingDialog
            propertyId={propertyId}
            isOpen={isAddBookingDialogOpen}
            onOpenChange={setIsAddBookingDialogOpen}
          />
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
            booked: bookedDays
          }}
        />
      </CardContent>
    </Card>
  );
};
