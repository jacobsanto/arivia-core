
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import type { Property } from "@/types/property.types";
import { BookingCalendarView } from "./BookingCalendarView";
import { BookingsList } from "./BookingsList";

interface BookingCalendarProps {
  property: Property;
  onBack: () => void;
}

const BookingCalendar = ({ property, onBack }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground">{property.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <BookingCalendarView 
          propertyId={property.id}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <BookingsList 
          propertyId={property.id}
          selectedDate={selectedDate} 
        />
      </div>
    </div>
  );
};

export default BookingCalendar;
