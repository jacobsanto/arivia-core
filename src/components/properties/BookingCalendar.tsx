
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import BookingForm from "./BookingForm";

// Sample booking data
const sampleBookings = [
  {
    id: 1,
    guestName: "John & Sarah Miller",
    checkIn: "2025-04-01",
    checkOut: "2025-04-08",
    status: "Confirmed",
    guests: 3,
    totalAmount: "€3,150"
  },
  {
    id: 2,
    guestName: "Roberto Garcia",
    checkIn: "2025-04-09",
    checkOut: "2025-04-15",
    status: "Confirmed",
    guests: 4,
    totalAmount: "€2,700"
  },
  {
    id: 3,
    guestName: "Emma Thompson",
    checkIn: "2025-05-02",
    checkOut: "2025-05-09",
    status: "Pending",
    guests: 2,
    totalAmount: "€3,360"
  }
];

interface BookingCalendarProps {
  property: any;
  onBack: () => void;
}

const BookingCalendar = ({ property, onBack }: BookingCalendarProps) => {
  const [bookings] = useState(sampleBookings);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  
  const handleAddBooking = () => {
    setIsAddBookingOpen(true);
  };

  const handleBookingCreated = (booking: any) => {
    toast.success(`Booking for ${booking.guestName} has been created`);
    setIsAddBookingOpen(false);
    // In a real app, we would add the booking to state/database
  };

  // Function to determine which dates have bookings
  const getDayHasBooking = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Check if date falls within any booking range
    return bookings.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(dateString);
      
      return currentDate >= checkIn && currentDate <= checkOut;
    });
  };
  
  // Create a custom day class name function
  const dayClassName = (date: Date) => {
    return getDayHasBooking(date) ? "bg-blue-100" : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{property.name}</h2>
          <p className="text-muted-foreground">Booking Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Availability</CardTitle>
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Calendar 
              className="pointer-events-auto"
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
              modifiers={{
                booked: (date) => getDayHasBooking(date)
              }}
              modifiersClassNames={{
                booked: "bg-blue-100"
              }}
            />
            <div className="mt-4 flex gap-2 items-center text-sm">
              <div className="w-4 h-4 bg-blue-100 rounded-sm"></div>
              <span>Booked</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bookings</CardTitle>
            <Button size="sm" onClick={handleAddBooking}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.guestName}</TableCell>
                    <TableCell>{booking.checkIn}</TableCell>
                    <TableCell>{booking.checkOut}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>{booking.totalAmount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing booking for ${booking.guestName}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Booking Dialog */}
      <Dialog open={isAddBookingOpen} onOpenChange={setIsAddBookingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          <BookingForm 
            propertyId={property.id} 
            propertyName={property.name} 
            onSubmit={handleBookingCreated} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCalendar;
