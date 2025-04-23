
import React from "react";
import { BookingSyncButton } from "./BookingSyncButton";

interface ManageBookingsHeaderProps {
  listingId: string;
  onSyncComplete: () => void;
}

const ManageBookingsHeader: React.FC<ManageBookingsHeaderProps> = ({
  listingId,
  onSyncComplete,
}) => (
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">Bookings</h2>
    <BookingSyncButton 
      listingId={listingId} 
      onSyncComplete={onSyncComplete} 
      size="sm"
    />
  </div>
);

export default ManageBookingsHeader;
