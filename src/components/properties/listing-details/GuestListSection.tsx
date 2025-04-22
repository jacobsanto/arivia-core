
import React from "react";
import GuestCard, { Guest } from "./GuestCard";

interface GuestListSectionProps {
  title: string;
  guests: Guest[];
  onWelcomeKit: (guest: Guest) => void;
  onCustomMessage: (guest: Guest) => void;
  onSendHandbook: (guest: Guest) => void;
}

const GuestListSection: React.FC<GuestListSectionProps> = ({
  title,
  guests,
  onWelcomeKit,
  onCustomMessage,
  onSendHandbook
}) => {
  if (guests.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-3">
        {guests.map(guest => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onWelcomeKit={onWelcomeKit}
            onCustomMessage={onCustomMessage}
            onSendHandbook={onSendHandbook}
          />
        ))}
      </div>
    </section>
  );
};

export default GuestListSection;
