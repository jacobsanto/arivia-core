
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SyncProgressProps {
  current: number;
  total: number;
  bookingsSynced: number;
  estimatedTimeLeft: string;
}

const SyncProgress: React.FC<SyncProgressProps> = ({
  current,
  total,
  bookingsSynced,
  estimatedTimeLeft
}) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          Syncing {current} of {total} listings
        </span>
        <span className="text-muted-foreground">
          Est. time left: {estimatedTimeLeft}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <p className="text-sm flex items-center gap-2">
        <LoadingSpinner size="xsmall" />
        {bookingsSynced} bookings synced
      </p>
    </div>
  );
};

export default SyncProgress;
