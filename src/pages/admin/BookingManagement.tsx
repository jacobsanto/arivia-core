
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookingDataTable from "@/components/bookings/BookingDataTable";
import BookingRecordView from "@/components/bookings/BookingRecordView";
import { toast } from "sonner";

// Mock data - replace with actual data fetching
const mockBookings = [
  {
    id: "booking-001",
    guest_name: "John Smith",
    guest_email: "john@example.com",
    guest_phone: "+1 234-567-8901",
    check_in_date: "2024-04-01",
    check_out_date: "2024-04-08",
    num_guests: 2,
    total_price: 1200,
    status: "confirmed",
    property_name: "Villa Caldera",
    internal_notes: "VIP guest - preferred room with ocean view"
  },
  {
    id: "booking-002",
    guest_name: "Maria Garcia",
    guest_email: "maria@example.com",
    check_in_date: "2024-04-15",
    check_out_date: "2024-04-22",
    num_guests: 4,
    total_price: 2800,
    status: "pending",
    property_name: "Azure Suite"
  }
];

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState(mockBookings);

  const selectedBooking = selectedBookingId 
    ? bookings.find(b => b.id === selectedBookingId)
    : null;

  const handleUpdateNotes = (bookingId: string, notes: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, internal_notes: notes }
        : booking
    ));
    toast.success("Notes updated successfully");
  };

  const handleAssignTask = (bookingId: string) => {
    toast.info("Task assignment functionality would open here");
    // TODO: Implement task assignment modal/flow
  };

  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  if (selectedBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedBookingId(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold">Booking Details</h1>
        </div>

        <BookingRecordView
          booking={selectedBooking}
          onUpdateNotes={handleUpdateNotes}
          onAssignTask={handleAssignTask}
          canEdit={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Booking Records</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingDataTable
            bookings={bookings}
            onViewBooking={handleViewBooking}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;
