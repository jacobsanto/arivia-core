
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, CalendarIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
}) => (
  <div className="flex flex-col md:flex-row gap-2 mt-6">
    <Button
      variant="default"
      className="w-full md:w-auto flex items-center justify-center"
      onClick={onSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <LoadingSpinner size="small" className="mr-2" />
          <span>Syncing Listings...</span>
        </>
      ) : (
        <>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Sync Listings Now
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
);

export default GuestySyncControls;
