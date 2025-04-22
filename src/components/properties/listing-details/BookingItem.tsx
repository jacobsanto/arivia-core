
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ClipboardList, Brush, Check } from "lucide-react";
import { formatDate } from '@/services/dataFormatService';

interface BookingItemProps {
  booking: any;
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (bookingId: string) => void;
  isCleaningTriggered?: boolean;
}

export const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  onTriggerCleaning,
  onMarkCleaned,
  isCleaningTriggered = false,
}) => {
  const checkInDate = formatDate(booking.check_in);
  const checkOutDate = formatDate(booking.check_out);

  const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "default";
      case "canceled":
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-medium">{booking.guest_name || "Guest"}</h3>
            <Badge variant={getBadgeVariant(booking.status)}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || "Unknown"}
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
                  <Brush className="h-3.5 w-3.5 mr-1.5" />
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

            <Button size="sm" variant="ghost" className="text-xs">
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
