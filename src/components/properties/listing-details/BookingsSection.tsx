import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Users, EuroIcon, ChevronDown, ChevronUp, Mail, Phone, MapPin, Home } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useGuestyListingBookings } from '@/hooks/useGuestyListingBookings';
import { formatDate } from '@/services/dataFormatService';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { housekeepingService } from '@/services/housekeeping/housekeeping.service';

interface BookingsSectionProps {
  listingId: string;
}

export function BookingsSection({ listingId }: BookingsSectionProps) {
  const { data, isLoading } = useGuestyListingBookings(listingId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const generateHousekeepingTasks = async (booking: any) => {
    try {
      const bookingObj = {
        id: booking.id,
        property_id: booking.listing_id,
        listing_id: booking.listing_id,
        check_in_date: booking.check_in,
        check_out_date: booking.check_out,
        guest_name: booking.guest_name || 'Guest',
        ...booking
      };
      
      await housekeepingService.generateTasksFromBooking(bookingObj);
      
      queryClient.invalidateQueries({queryKey: ['housekeeping-tasks']});
    } catch (error) {
      console.error('Error generating housekeeping tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate housekeeping tasks",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const bookings = data?.bookings || [];
  const stats = data?.stats;
  
  if (!bookings?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bookings found for this property
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-2xl font-semibold">{stats.totalBookings}</span>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-green-600">{stats.confirmedBookings}</span>
                <span className="text-sm text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-blue-600">{stats.upcomingBookings}</span>
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-red-600">{stats.cancelledBookings}</span>
                <span className="text-sm text-muted-foreground">Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {bookings.map((booking) => (
        <BookingCard 
          key={booking.id} 
          booking={booking} 
          onGenerateHousekeepingTasks={generateHousekeepingTasks} 
        />
      ))}
    </div>
  );
}

interface BookingCardProps {
  booking: any;
  onGenerateHousekeepingTasks: (booking: any) => Promise<void>;
}

function BookingCard({ booking, onGenerateHousekeepingTasks }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  const guestData = booking.raw_data?.guest || {};
  const guestsCount = 
    (booking.raw_data?.guests?.adults || 0) + 
    (booking.raw_data?.guests?.children || 0);
  const moneyData = booking.raw_data?.money || {};
  
  const stayDuration = calculateStayDuration(booking.check_in, booking.check_out);
  
  const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'canceled':
      case 'cancelled':
        return 'destructive';
      case 'inquiry':
      case 'inquiry_confirmed':
        return 'secondary';
      default:
        return 'outline';
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
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {stayDuration} {stayDuration === 1 ? 'night' : 'nights'}
              </span>
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

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Guest Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {guestData.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{guestData.email}</span>
                    </div>
                  )}
                  {guestData.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{guestData.phone}</span>
                    </div>
                  )}
                  {guestData.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{guestData.address}</span>
                    </div>
                  )}
                  {guestData.country && (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{guestData.country}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {booking.raw_data?.checkInTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-muted-foreground">Check-in</span>
                    <span>{booking.raw_data.checkInTime}</span>
                  </div>
                  {booking.raw_data?.checkOutTime && (
                    <div>
                      <span className="block text-xs text-muted-foreground">Check-out</span>
                      <span>{booking.raw_data.checkOutTime}</span>
                    </div>
                  )}
                </div>
              )}

              {booking.raw_data?.note && (
                <div>
                  <span className="font-medium">Guest Notes:</span>
                  <p className="mt-1 text-muted-foreground">{booking.raw_data.note}</p>
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onGenerateHousekeepingTasks(booking);
                  }}
                >
                  Generate Housekeeping Tasks
                </Button>
              </div>
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

function calculateStayDuration(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
