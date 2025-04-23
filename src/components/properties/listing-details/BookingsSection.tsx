
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Users, EuroIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useGuestyListingBookings } from '@/hooks/useGuestyListingBookings';
import { formatDate } from '@/services/dataFormatService';

interface BookingsSectionProps {
  listingId: string;
}

export function BookingsSection({ listingId }: BookingsSectionProps) {
  const { data: bookings, isLoading } = useGuestyListingBookings(listingId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!bookings?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bookings found for this property
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

interface BookingCardProps {
  booking: any;
}

function BookingCard({ booking }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract guest info
  const guestData = booking.raw_data?.guest || {};
  const guestsCount = 
    (booking.raw_data?.guests?.adults || 0) + 
    (booking.raw_data?.guests?.children || 0);
  const moneyData = booking.raw_data?.money || {};
  
  const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'canceled':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-medium">{booking.guest_name || 'Guest'}</h3>
          <Badge variant={getBadgeVariant(booking.status)}>
            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
            </span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{guestsCount} guests</span>
          </div>
          
          <div className="flex items-center">
            <EuroIcon className="h-4 w-4 mr-2" />
            <span>€{moneyData.netAmount || 0}</span>
          </div>
        </div>

        {/* Expandable section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2 text-sm">
              {guestData.email && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{guestData.email}</span>
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

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
