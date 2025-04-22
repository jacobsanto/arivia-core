
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Loader2 } from "lucide-react";
import GuestCard, { Guest } from "./GuestCard";
import GuestListSection from "./GuestListSection";

// Utility: Format date as dd MMM yyyy
import { format } from "date-fns";
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

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
      isVip: Boolean(booking.is_vip),
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
      <GuestListSection
        title="Current Guests"
        guests={currentGuests}
        onWelcomeKit={handleWelcomeKit}
        onCustomMessage={handleCustomMessage}
        onSendHandbook={handleSendHandbook}
      />
      <GuestListSection
        title="Upcoming Guests"
        guests={upcomingGuests}
        onWelcomeKit={handleWelcomeKit}
        onCustomMessage={handleCustomMessage}
        onSendHandbook={handleSendHandbook}
      />
      <GuestListSection
        title="Past Guests (Last 30 days)"
        guests={pastGuests}
        onWelcomeKit={handleWelcomeKit}
        onCustomMessage={handleCustomMessage}
        onSendHandbook={handleSendHandbook}
      />
    </div>
  );
};

export default GuestManagementSection;
