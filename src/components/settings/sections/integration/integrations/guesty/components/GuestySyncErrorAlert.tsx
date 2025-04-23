
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GuestySyncErrorAlertProps {
  syncError: string | null;
  retryCountdown: number | null;
  onRetry: () => void;
}

const GuestySyncErrorAlert: React.FC<GuestySyncErrorAlertProps> = ({
  syncError,
  retryCountdown,
  onRetry,
}) => {
  if (!syncError) return null;
  return (
    <div
      className="flex items-center gap-2 mt-2 px-4 py-2 bg-red-50 text-red-800 rounded border border-red-200 text-sm"
      data-testid="inline-sync-error"
    >
      <X className="w-5 h-5 text-red-500" />
      <span className="font-medium">{syncError}</span>
      {retryCountdown !== null && (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4"
          onClick={onRetry}
        >
          Retry Now {retryCountdown > 0 ? `(${retryCountdown}s)` : ''}
        </Button>
      )}
    </div>
  );
};

export default GuestySyncErrorAlert;
