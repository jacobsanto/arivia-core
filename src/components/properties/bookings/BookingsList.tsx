
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "./useBookings";
import { formatDate } from "@/services/dataFormatService";

interface BookingsListProps {
  propertyId: string;
  selectedDate: Date | undefined;
}

export const BookingsList = ({ propertyId, selectedDate }: BookingsListProps) => {
  const { bookings, isLoading } = useBookings(propertyId);

  // Filter bookings by month if a date is selected
  const filteredBookings = selectedDate 
    ? bookings.filter(booking => {
        try {
          const bookingMonth = new Date(booking.check_in_date).getMonth();
          const selectedMonth = selectedDate.getMonth();
          return bookingMonth === selectedMonth;
        } catch (error) {
          console.error('Error filtering booking by month:', error);
          return false;
        }
      })
    : bookings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedDate
            ? `Bookings for ${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getFullYear()}`
            : 'All Bookings'
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BookingsContent 
          bookings={filteredBookings} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};

interface BookingsContentProps {
  bookings: any[];
  isLoading: boolean;
}

export const BookingsContent = ({ bookings, isLoading }: BookingsContentProps) => {
  if (isLoading) {
    return <BookingsLoadingState />;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bookings found for this period.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Check-In</TableHead>
            <TableHead>Check-Out</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{booking.guest_name}</div>
                  <div className="text-sm text-muted-foreground">{booking.guest_email}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(booking.check_in_date)}</TableCell>
              <TableCell>{formatDate(booking.check_out_date)}</TableCell>
              <TableCell>{booking.num_guests || 'N/A'}</TableCell>
              <TableCell>€{booking.total_price || 0}</TableCell>
              <TableCell>
                <BookingStatusBadge status={booking.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const BookingStatusBadge = ({ status }: { status: string }) => {
  const variant = 
    status === 'confirmed' ? 'default' :
    status === 'pending' ? 'outline' :
    status === 'cancelled' ? 'destructive' : 'secondary';
  
  return (
    <Badge variant={variant as any}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const BookingsLoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);
