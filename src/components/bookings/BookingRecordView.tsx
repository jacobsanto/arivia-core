
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Phone, Mail, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface BookingRecord {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status: string;
  property_name?: string;
  internal_notes?: string;
}

interface BookingRecordViewProps {
  booking: BookingRecord;
  onUpdateNotes?: (bookingId: string, notes: string) => void;
  onAssignTask?: (bookingId: string) => void;
  canEdit?: boolean;
}

const BookingRecordView: React.FC<BookingRecordViewProps> = ({
  booking,
  onUpdateNotes,
  onAssignTask,
  canEdit = false
}) => {
  const [notes, setNotes] = React.useState(booking.internal_notes || '');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            Booking #{booking.id.slice(-8)}
          </CardTitle>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guest Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Guest Information
            </h4>
            <div className="pl-6 space-y-1 text-sm">
              <p><strong>Name:</strong> {booking.guest_name}</p>
              {booking.guest_email && (
                <p className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {booking.guest_email}
                </p>
              )}
              {booking.guest_phone && (
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {booking.guest_phone}
                </p>
              )}
              <p><strong>Guests:</strong> {booking.num_guests}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Stay Details
            </h4>
            <div className="pl-6 space-y-1 text-sm">
              <p><strong>Check-in:</strong> {formatDate(booking.check_in_date)}</p>
              <p><strong>Check-out:</strong> {formatDate(booking.check_out_date)}</p>
              <p className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <strong>Total:</strong> ${booking.total_price}
              </p>
              {booking.property_name && (
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.property_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Internal Operations */}
        {canEdit && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Internal Operations</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Internal Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this booking..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onUpdateNotes?.(booking.id, notes)}
                >
                  Save Notes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAssignTask?.(booking.id)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Assign Task
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingRecordView;
