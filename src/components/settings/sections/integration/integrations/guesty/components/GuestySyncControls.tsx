
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Calendar, BarChart3 } from "lucide-react";
import { useGuestyApiMonitor } from "../hooks/useGuestyApiMonitor";

interface GuestySyncControlsProps {
  onSync: () => void;
  onSendTestWebhook: () => void;
  isSyncing: boolean;
  isSendingTestWebhook: boolean;
}

const GuestySyncControls: React.FC<GuestySyncControlsProps> = ({
  onSync,
  onSendTestWebhook,
  isSyncing,
  isSendingTestWebhook,
}) => {
  const { hasRecentRateLimitAlert, rateLimitErrors } = useGuestyApiMonitor();
  
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
      <Button
        onClick={onSync}
        disabled={isSyncing || (hasRecentRateLimitAlert && rateLimitErrors && rateLimitErrors.length >= 3)}
        className="flex-1 relative"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <BarChart3 className="h-4 w-4 mr-2" />
        )}
        {isSyncing ? "Syncing..." : "Sync Listings"}
        
        {/* Warning badge for rate limits */}
        {hasRecentRateLimitAlert && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        )}
      </Button>
      
      <Button
        onClick={onSendTestWebhook}
        disabled={isSendingTestWebhook || hasRecentRateLimitAlert}
        variant="outline"
        className="flex-1"
      >
        {isSendingTestWebhook ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Calendar className="h-4 w-4 mr-2" />
        )}
        {isSendingTestWebhook ? "Sending..." : "Test Booking Webhook"}
      </Button>

      {/* Rate limit warning message */}
      {hasRecentRateLimitAlert && rateLimitErrors && rateLimitErrors.length >= 3 && (
        <div className="mt-1 rounded-md bg-yellow-50 p-2 border border-yellow-200 text-yellow-700 text-xs flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Multiple rate limits detected. Sync disabled for cooldown period.
            ({rateLimitErrors.length} in last 5 minutes)
          </span>
        </div>
      )}
    </div>
  );
};

export default GuestySyncControls;
