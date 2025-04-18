
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
        <span className="flex items-center">
          {syncingData ? <span>Syncing...</span> : <span>Sync Now</span>}
        </span>
      </Button>
      <Button 
        variant="outline" 
        onClick={onClearOfflineData}
        disabled={totalOfflineItems === 0}
      >
        <span>Clear Offline Data</span>
      </Button>
    </div>
  );
};

export default OfflineDataActions;
