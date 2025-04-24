
import React from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { RateLimitError } from "../types";

interface RateLimitToastProps {
  endpoint: string;
  resetTime: string | null;
  remaining: number | null;
}

export const showRateLimitToast = (
  endpoint: string, 
  resetTime: string | null, 
  remaining: number | null
) => {
  toast.warning(
    <div className="flex gap-2 items-start w-full">
      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium mb-0.5">API Rate Limit Warning</p>
        <p className="text-sm text-muted-foreground">
          The Guesty API rate limit was reached for{" "}
          <span className="font-medium">{endpoint}</span> endpoint.
        </p>
        {resetTime && (
          <p className="text-xs mt-1">
            {remaining === 0
              ? `Full capacity will reset ${resetTime}`
              : `${remaining} requests remaining. Resets ${resetTime}`}
          </p>
        )}
      </div>
    </div>,
    {
      duration: 8000,
      action: {
        label: "Dismiss",
        onClick: () => toast.dismiss(),
      },
    }
  );
};

export const useRateLimitToasts = (rateLimitErrors: RateLimitError[] | undefined) => {
  React.useEffect(() => {
    if (!rateLimitErrors || rateLimitErrors.length === 0) return;
    
    // Only show for the most recent error and only if it happened in the last 5 minutes
    const mostRecent = rateLimitErrors[0];
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    if (new Date(mostRecent.timestamp) > fiveMinutesAgo) {
      const resetTime = mostRecent.reset 
        ? new Date(mostRecent.reset).toLocaleTimeString() 
        : null;
        
      showRateLimitToast(mostRecent.endpoint, resetTime, mostRecent.remaining);
    }
  }, [rateLimitErrors]);
};

export default showRateLimitToast;
