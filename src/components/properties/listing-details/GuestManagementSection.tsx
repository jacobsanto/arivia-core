import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Loader2 } from "lucide-react";
import { Guest } from "./GuestCard";
import GroupedGuestLists from "./GroupedGuestLists";
import { useGuestGroups } from "./GuestGrouping";
import { useGuestyBookings } from "./useGuestyBookings";

interface GuestManagementSectionProps {
  listing: any;
  bookings: any[];
  isLoading: boolean;
}

const HANDBOOK_URL = "https://arivia-handbook-public-url.com/arivia_welcome_kit.pdf"; // TODO: Update or fetch from storage as needed

const GuestManagementSection: React.FC<GuestManagementSectionProps> = ({
  listing,
  // bookings,
  isLoading,
}) => {
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);

  // Use unified Guesty bookings hook
  const { bookingsWithTasks, loading: loadingBookings } = useGuestyBookings(listing?.id);

  // Prepare guests array from bookings
  const guests: Guest[] = bookingsWithTasks.map(({ booking }) => {
    const rawData = booking.raw_data || {};
    const guestData = rawData.guest || {};
    return {
      id: booking.id,
      name: booking.guest_name || guestData.fullName || "Guest",
      email: guestData.email || null,
      phone: guestData.phone || null,
      check_in: booking.check_in,
      check_out: booking.check_out,
      isVip: Boolean(rawData.is_vip || rawData.vip || false),
      notes: rawData.notes || guestData.comments || undefined,
    };
  });

  const { currentGuests, upcomingGuests, pastGuests } = useGuestGroups(guests);

  const handleWelcomeKit = (guest: Guest) => {
    setSendingGuestId(guest.id);
    setTimeout(() => {
      toast.success("Welcome Kit sent", { description: `Sent to ${guest.name}` });
      setSendingGuestId(null);
    }, 900);
  };

  const handleCustomMessage = (guest: Guest) => {
    toast("Custom message composer (not implemented)", {
      description: `To: ${guest.name} (${guest.email || guest.phone || "no contact"})`,
    });
  };

  const handleSendHandbook = (guest: Guest) => {
    window.open(HANDBOOK_URL, "_blank");
    toast("Handbook link opened", { description: `Sent handbook to ${guest.name}` });
  };

  if (isLoading || loadingBookings) {
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
    <GroupedGuestLists
      currentGuests={currentGuests}
      upcomingGuests={upcomingGuests}
      pastGuests={pastGuests}
      onWelcomeKit={handleWelcomeKit}
      onCustomMessage={handleCustomMessage}
      onSendHandbook={handleSendHandbook}
    />
  );
};

export default GuestManagementSection;
