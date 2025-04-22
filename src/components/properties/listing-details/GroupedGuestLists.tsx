
import React from "react";
import { Guest } from "./GuestCard";
import GuestListSection from "./GuestListSection";

interface GroupedGuestListsProps {
  currentGuests: Guest[];
  upcomingGuests: Guest[];
  pastGuests: Guest[];
  onWelcomeKit: (guest: Guest) => void;
  onCustomMessage: (guest: Guest) => void;
  onSendHandbook: (guest: Guest) => void;
}

const GroupedGuestLists: React.FC<GroupedGuestListsProps> = ({
  currentGuests,
  upcomingGuests,
  pastGuests,
  onWelcomeKit,
  onCustomMessage,
  onSendHandbook
}) => (
  <div className="space-y-6">
    <GuestListSection
      title="Current Guests"
      guests={currentGuests}
      onWelcomeKit={onWelcomeKit}
      onCustomMessage={onCustomMessage}
      onSendHandbook={onSendHandbook}
    />
    <GuestListSection
      title="Upcoming Guests"
      guests={upcomingGuests}
      onWelcomeKit={onWelcomeKit}
      onCustomMessage={onCustomMessage}
      onSendHandbook={onSendHandbook}
    />
    <GuestListSection
      title="Past Guests (Last 30 days)"
      guests={pastGuests}
      onWelcomeKit={onWelcomeKit}
      onCustomMessage={onCustomMessage}
      onSendHandbook={onSendHandbook}
    />
  </div>
);

export default GroupedGuestLists;
