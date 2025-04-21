
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

interface GuestySyncControlsProps {
  onTest: () => void;
  onSync: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isConnected: boolean;
}

const GuestySyncControls = ({
  onTest,
  onSync,
  isTesting,
  isSyncing,
  isConnected
}: GuestySyncControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        onClick={onTest} 
        disabled={isTesting}
        className="shrink-0"
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Connection'
        )}
      </Button>

      <Button
        variant="outline"
        onClick={onSync}
        disabled={isSyncing || !isConnected}
        className="shrink-0"
      >
        <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  );
};

export default GuestySyncControls;
