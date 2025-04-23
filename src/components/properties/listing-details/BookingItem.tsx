
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from '@/services/dataFormatService';
import { BookingTaskBadge } from "./BookingTaskBadge";

interface BookingItemProps {
  booking: any;
  onTriggerCleaning: (bookingId: string) => void;
  onMarkCleaned: (taskId: string) => void;
  isCleaningTriggered?: boolean;
  cleaningTask?: any;
}

export const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  onTriggerCleaning,
  onMarkCleaned,
  isCleaningTriggered = false,
  cleaningTask = null,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const totalGuests = 
    (booking.raw_data?.guests?.adults || 0) + 
    (booking.raw_data?.guests?.children || 0);
  const infantCount = booking.raw_data?.guests?.infants || 0;
  
  const guestDetails = [
    totalGuests > 0 ? `${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}` : '',
    infantCount > 0 ? `${infantCount} ${infantCount === 1 ? 'Infant' : 'Infants'}` : ''
  ].filter(Boolean).join(', ');

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

  const formatAmount = (rawData: any) => {
    if (!rawData?.money) return 'N/A';
    const amount = rawData.money.netAmount;
    const currency = rawData.money.currency || 'EUR';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-medium">{booking.guest_name || "Guest"}</h3>
          <Badge variant={getBadgeVariant(booking.status)}>
            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || "Unknown"}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Check-in: {checkInDate}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Check-out: {checkOutDate}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{guestDetails || 'No guest info'}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{formatAmount(booking.raw_data)}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-2 text-sm">
              {booking.raw_data?.guest?.email && (
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {booking.raw_data.guest.email}
                </div>
              )}
              {booking.raw_data?.guest?.phone && (
                <div>
                  <span className="font-medium">Phone:</span>{' '}
                  {booking.raw_data.guest.phone}
                </div>
              )}
              {booking.raw_data?.note && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-muted-foreground">{booking.raw_data.note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {cleaningTask ? (
            <BookingTaskBadge status={cleaningTask.status} />
          ) : isCleaningTriggered ? (
            <Badge variant="outline" className="bg-muted/20">
              Cleaning Scheduled
            </Badge>
          ) : booking.status?.toLowerCase() === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTriggerCleaning(booking.id)}
            >
              Schedule Cleaning
            </Button>
          )}

          {cleaningTask && cleaningTask.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkCleaned(cleaningTask.id)}
            >
              Mark as Cleaned
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
