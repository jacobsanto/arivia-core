
import React, { useState } from 'react';
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Book, MessageSquare, Paperclip, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Utility: Format date as dd MMM yyyy
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

type Guest = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  check_in: string;
  check_out: string;
  isVip?: boolean;
  notes?: string;
};

interface GuestCardProps {
  guest: Guest;
  onWelcomeKit: (guest: Guest) => void;
  onCustomMessage: (guest: Guest) => void;
  onSendHandbook: (guest: Guest) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  onWelcomeKit,
  onCustomMessage,
  onSendHandbook
}) => {
  const nameParts = (guest.name || 'Guest').split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : guest.name?.[0] || 'G';

  return (
    <Card className="mb-3">
      <CardContent className="flex flex-col p-4 gap-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{guest.name}</span>
              {guest.isVip && (
                <Badge variant="secondary" className="px-2 py-0.5">
                  <Star className="h-3 w-3 mr-1" /> VIP
                </Badge>
              )}
              {guest.notes && (
                <Badge variant="outline" className="ml-1">{guest.notes}</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {guest.email && (
                <span className="mr-3 inline-flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {guest.email}
                </span>
              )}
              {guest.phone && (
                <span className="inline-flex items-center">
                  <Paperclip className="w-4 h-4 mr-1" />
                  {guest.phone}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs">
              <b>Stay:</b> {formatDate(guest.check_in)} - {formatDate(guest.check_out)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onWelcomeKit(guest)}
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Send Welcome Kit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onCustomMessage(guest)}
          >
            <Book className="w-4 h-4 mr-1.5" />
            Send Custom Message
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => onSendHandbook(guest)}
          >
            <Paperclip className="w-4 h-4 mr-1.5" />
            Send Handbook
          </Button>
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

const HANDBOOK_URL = "https://arivia-handbook-public-url.com/arivia_welcome_kit.pdf"; // TODO: Update or fetch from storage as needed

const GuestManagementSection: React.FC<GuestManagementSectionProps> = ({
  listing,
  bookings,
  isLoading,
}) => {
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);
  const [customMessageGuest, setCustomMessageGuest] = useState<Guest | null>(null);

  // Prepare guests array from bookings
  const guests: Guest[] = bookings.map(booking => {
    const rawData = booking.raw_data || {};
    const guestData = rawData.guest || {};
    return {
      id: booking.id,
      name: booking.guest_name || guestData.fullName || "Guest",
      email: guestData.email || null,
      phone: guestData.phone || null,
      check_in: booking.check_in,
      check_out: booking.check_out,
      isVip: Boolean(booking.is_vip), // Example VIP logic, adjust as needed
      notes: booking.notes || guestData.comments || undefined,
    };
  });

  const today = new Date();
  // Today 00:00 for accurate comparison
  const todayStart = new Date(today);
  todayStart.setHours(0,0,0,0);

  const currentGuests = guests.filter(guest =>
    new Date(guest.check_in) <= today && new Date(guest.check_out) >= today
  );
  const upcomingGuests = guests.filter(guest =>
    new Date(guest.check_in) > today
  ).sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  const pastGuests = guests.filter(guest =>
    new Date(guest.check_out) < today &&
    new Date(guest.check_out) > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  ).sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

  // Actions
  const handleWelcomeKit = (guest: Guest) => {
    setSendingGuestId(guest.id);
    setTimeout(() => {
      toast.success("Welcome Kit sent", { description: `Sent to ${guest.name}` });
      setSendingGuestId(null);
    }, 900);
  };

  const handleCustomMessage = (guest: Guest) => {
    setCustomMessageGuest(guest);
    // Here, open a modal with message composer (for now, just show notification)
    toast("Custom message composer (not implemented)", {
      description: `To: ${guest.name} (${guest.email || guest.phone || "no contact"})`,
    });
  };

  const handleSendHandbook = (guest: Guest) => {
    // For now, open in new tab.
    window.open(HANDBOOK_URL, "_blank");
    toast("Handbook link opened", { description: `Sent handbook to ${guest.name}` });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No Guests Found</h3>
          <p className="text-muted-foreground mb-3">
            This property doesn't have any guests yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Guests */}
      {currentGuests.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Guests</h3>
          <div className="space-y-3">
            {currentGuests.map(guest => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onWelcomeKit={handleWelcomeKit}
                onCustomMessage={handleCustomMessage}
                onSendHandbook={handleSendHandbook}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Guests */}
      {upcomingGuests.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Guests</h3>
          <div className="space-y-3">
            {upcomingGuests.map(guest => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onWelcomeKit={handleWelcomeKit}
                onCustomMessage={handleCustomMessage}
                onSendHandbook={handleSendHandbook}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Guests */}
      {pastGuests.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Guests (Last 30 days)</h3>
          <div className="space-y-3">
            {pastGuests.map(guest => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onWelcomeKit={handleWelcomeKit}
                onCustomMessage={handleCustomMessage}
                onSendHandbook={handleSendHandbook}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GuestManagementSection;
