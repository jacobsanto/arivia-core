
import React, { useState, useEffect } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/services/dataFormatService";
import { Property } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { Skeleton } from "@/components/ui/skeleton";

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  property_id: string;
}

interface BookingCalendarProps {
  property: Property;
  onBack: () => void;
}

const BookingCalendar = ({ property, onBack }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookings for the property
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', property.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setBookings(data || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        toastService.error('Failed to load bookings', {
          description: err.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [property.id]);

  // Calculate calendar day class names based on bookings
  const getDayClassNames = (day: Date): string => {
    const dateString = day.toISOString().split('T')[0];
    
    // Check if this day is included in any booking's date range
    const hasBooking = bookings.some(booking => {
      const checkInDate = booking.check_in_date;
      const checkOutDate = booking.check_out_date;
      
      return dateString >= checkInDate && dateString <= checkOutDate;
    });
    
    return hasBooking ? 'bg-blue-100 text-blue-900 rounded-md' : '';
  };

  // Filter bookings by month if a date is selected
  const filteredBookings = selectedDate 
    ? bookings.filter(booking => {
        const bookingMonth = new Date(booking.check_in_date).getMonth();
        const selectedMonth = selectedDate.getMonth();
        return bookingMonth === selectedMonth;
      })
    : bookings;

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
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'rgba(30, 64, 175, 1)',
                  fontWeight: 'bold'
                }
              }}
              dayClassName={getDayClassNames}
            />
          </CardContent>
        </Card>

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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings found for this period.</p>
              </div>
            ) : (
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
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guest_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.guest_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(booking.check_in_date)}</TableCell>
                        <TableCell>{formatDate(booking.check_out_date)}</TableCell>
                        <TableCell>{booking.num_guests}</TableCell>
                        <TableCell>€{booking.total_price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'outline' :
                              booking.status === 'cancelled' ? 'destructive' : 'secondary'
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCalendar;
