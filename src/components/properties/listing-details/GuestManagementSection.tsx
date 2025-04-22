
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { 
  MessageSquare, 
  Package, 
  Info, 
  Star,
  Loader2
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/services/dataFormatService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface GuestCardProps {
  guest: {
    name: string;
    email?: string;
    phone?: string;
    check_in: string;
    check_out: string;
    isVip?: boolean;
  };
}

const GuestCard: React.FC<GuestCardProps> = ({ guest }) => {
  const nameParts = (guest.name || 'Guest').split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[1][0]}` 
    : guest.name?.[0] || 'G';
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium truncate">{guest.name || 'Guest'}</h3>
              {guest.isVip && (
                <Badge variant="secondary" className="ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {guest.email && (
                <p className="truncate">{guest.email}</p>
              )}
              {guest.phone && (
                <p className="truncate">{guest.phone}</p>
              )}
              <p className="mt-0.5">
                Stay: {formatDate(guest.check_in)} - {formatDate(guest.check_out)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={() => toast.success("Welcome message sent")}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Message
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={() => toast.success("Welcome kit requested")}
              >
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Send Welcome Kit
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => toast.success("Guest info opened")}
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Info
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface GuestManagementSectionProps {
  listing: any;
  bookings: any[];
  isLoading: boolean;
}

const GuestManagementSection: React.FC<GuestManagementSectionProps> = ({ 
  listing, 
  bookings, 
  isLoading 
}) => {
  const [vipGuests, setVipGuests] = useState<string[]>([]);
  
  // Extract unique guests from bookings
  const guests = bookings.map(booking => {
    // Get guest data from raw_data if available
    const rawData = booking.raw_data || {};
    const guestData = rawData.guest || {};
    
    return {
      id: booking.id,
      name: booking.guest_name || guestData.fullName || 'Guest',
      email: guestData.email || null,
      phone: guestData.phone || null,
      check_in: booking.check_in,
      check_out: booking.check_out,
      isVip: vipGuests.includes(booking.id)
    };
  });
  
  // Filter guests by upcoming and recent
  const today = new Date();
  const upcomingGuests = guests
    .filter(guest => new Date(guest.check_in) >= today)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  
  const recentGuests = guests
    .filter(guest => 
      new Date(guest.check_out) < today && 
      new Date(guest.check_out) > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    )
    .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const handleMarkVIP = (guestId: string) => {
    setVipGuests(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId) 
        : [...prev, guestId]
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Guest Management</h2>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => toast.success("Guest handbook opened")}
        >
          View Guest Handbook
        </Button>
      </div>
      
      {/* Upcoming Guests Section */}
      {upcomingGuests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Guests</h3>
          <div className="space-y-3">
            {upcomingGuests.map((guest) => (
              <GuestCard key={guest.id} guest={guest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Guests Section */}
      {recentGuests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Guests</h3>
          <div className="space-y-3">
            {recentGuests.map((guest) => (
              <GuestCard key={guest.id} guest={guest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {guests.length === 0 && (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No Guests Found</h3>
            <p className="text-muted-foreground mb-4">
              This property doesn't have any guests yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuestManagementSection;
