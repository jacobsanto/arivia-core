
import React from "react";


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
  </div>
);

export default ManageBookingsHeader;
