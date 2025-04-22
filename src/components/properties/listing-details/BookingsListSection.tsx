
import React from "react";
import { Button } from "@/components/ui/button";
import { BookingItem } from "./BookingItem";

interface BookingsListSectionProps {
  title: string;
  bookings: any[];
  maxToShow: number;
  showViewAll?: boolean;
  viewAllLabel?: string;
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (bookingId: string) => void;
  triggeredCleanings?: string[];
}

export const BookingsListSection: React.FC<BookingsListSectionProps> = ({
  title,
  bookings,
  maxToShow,
  showViewAll,
  viewAllLabel,
  onTriggerCleaning,
  onMarkCleaned,
  triggeredCleanings = [],
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-3">
        {bookings.slice(0, maxToShow).map((booking) => (
          <BookingItem
            key={booking.id}
            booking={booking}
            onTriggerCleaning={onTriggerCleaning}
            onMarkCleaned={onMarkCleaned}
            isCleaningTriggered={triggeredCleanings.includes(booking.id)}
          />
        ))}
        {showViewAll && bookings.length > maxToShow && (
          <Button variant="ghost" className="w-full text-sm">
            {viewAllLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
