
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";

interface ManageBookingsHeaderProps {
  onSync: () => void;
  isSyncing: boolean;
}

const ManageBookingsHeader: React.FC<ManageBookingsHeaderProps> = ({
  onSync,
  isSyncing,
}) => (
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">Bookings</h2>
    <Button
      onClick={onSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          Sync Bookings
        </>
      )}
    </Button>
  </div>
);

export default ManageBookingsHeader;
