
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, CalendarIcon, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGuestySync } from "@/hooks/useGuestySync";
import { cn } from "@/lib/utils";

interface GuestySyncControlsProps {
  onSendTestWebhook: () => void;
  isSendingTestWebhook: boolean;
}

const GuestySyncControls: React.FC<GuestySyncControlsProps> = ({
  onSendTestWebhook,
  isSendingTestWebhook,
}) => {
  const { isSyncing, syncProgress, error, retryCountdown, sync } = useGuestySync();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <Button
          variant="default"
          className="w-full md:w-auto flex items-center justify-center"
          onClick={sync}
          disabled={isSyncing || (error && retryCountdown && retryCountdown > 0)}
        >
          {isSyncing ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              <span>Syncing Bookings...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sync Bookings Now
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center justify-center"
          onClick={onSendTestWebhook}
          disabled={isSendingTestWebhook}
        >
          {isSendingTestWebhook ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              <span>Sending Webhook...</span>
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Send Test Webhook
            </>
          )}
        </Button>
      </div>

      {/* Sync Progress */}
      {syncProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Syncing {syncProgress.currentListing} of {syncProgress.totalListings} listings
            </span>
            <span className="text-muted-foreground">
              Est. time left: {syncProgress.estimatedTimeLeft}
            </span>
          </div>
          <Progress 
            value={(syncProgress.currentListing / syncProgress.totalListings) * 100}
            className="h-2"
          />
          <p className="text-sm flex items-center gap-2">
            <LoadingSpinner size="xsmall" />
            {syncProgress.bookingsSynced} bookings synced
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={cn(
          "flex items-center gap-2 p-3 text-sm rounded-md",
          "bg-red-50 text-red-700 border border-red-200"
        )}>
          <XCircle className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            {retryCountdown !== null && retryCountdown > 0 && (
              <p className="text-sm mt-1">
                Retry available in {retryCountdown} seconds
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestySyncControls;
