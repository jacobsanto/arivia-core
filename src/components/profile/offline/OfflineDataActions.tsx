
import React from "react";
import { Button } from "@/components/ui/button";

interface OfflineDataActionsProps {
  totalOfflineItems: number;
  syncingData: boolean;
  onSyncData: () => void;
  onClearOfflineData: () => void;
}

const OfflineDataActions: React.FC<OfflineDataActionsProps> = ({
  totalOfflineItems,
  syncingData,
  onSyncData,
  onClearOfflineData,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        variant="default" 
        onClick={onSyncData}
        disabled={totalOfflineItems === 0 || syncingData}
      >
        {syncingData ? "Syncing..." : "Sync Now"}
      </Button>
      <Button 
        variant="outline" 
        onClick={onClearOfflineData}
        disabled={totalOfflineItems === 0}
      >
        Clear Offline Data
      </Button>
    </div>
  );
};

export default OfflineDataActions;
