
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatTimeAgo } from "@/services/dataFormatService";
import { Check, X, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SyncLog } from "./syncLog.types";

interface SyncLogCardProps {
  log: SyncLog;
  onRetrySync?: (log: SyncLog) => void;
  isRetrying?: boolean;
}

const getStatusBadge = (status?: string | null) => {
  if (status?.toLowerCase() === "completed" || status?.toLowerCase() === "success") {
    return (
      <Badge variant="success" className="gap-1 px-2 py-1 min-h-[24px]">
        <Check size={16} className="text-green-700" /> <span>Success</span>
      </Badge>
    );
  }
  if (status?.toLowerCase() === "error" || status?.toLowerCase() === "failed" || status?.toLowerCase() === "failure") {
    return (
      <Badge variant="destructive" className="gap-1 px-2 py-1 min-h-[24px]">
        <X size={16} className="text-red-700" /> <span>Error</span>
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 px-2 py-1 min-h-[24px]">
      {status || "Unknown"}
    </Badge>
  );
};

// Format duration from milliseconds to a human-readable string
const formatDuration = (durationMs: number | null | undefined) => {
  if (!durationMs) return null;
  
  if (durationMs < 1000) return `${durationMs}ms`;
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const SyncLogCard: React.FC<SyncLogCardProps> = ({ log, onRetrySync, isRetrying = false }) => {
  // Use either UI-friendly properties or fall back to original properties
  const timestamp = log.synced_at || log.end_time || log.start_time || log.created_at || "";
  const msg = log.message || log.error_message || "";
  const integration = log.integration || log.service || "";
  
  // Calculate duration if possible
  const duration = log.duration_ms || log.sync_duration
    ? formatDuration(log.duration_ms || log.sync_duration)
    : null;
  
  // Use simplified metrics if available, otherwise calculate
  const totalListings = log.total_listings !== undefined 
    ? log.total_listings 
    : ((log.listings_created || 0) + (log.listings_updated || 0) + (log.listings_deleted || 0)) || 0;
    
  const totalBookings = log.total_bookings !== undefined
    ? log.total_bookings
    : ((log.bookings_created || 0) + (log.bookings_updated || 0) + (log.bookings_deleted || 0)) || 0;
    
  const hasMetrics = duration || totalListings > 0 || totalBookings > 0;
  
  const showRetryButton = 
    (log.status?.toLowerCase() === "error" || 
    log.status?.toLowerCase() === "failed" || 
    log.status?.toLowerCase() === "failure") && 
    onRetrySync;

  return (
    <div
      className="bg-card border rounded-xl px-4 py-4 shadow-sm flex flex-col transition hover:ring-2 hover:ring-primary/20 focus:outline-none min-h-[44px]
      md:grid md:grid-cols-[minmax(120px,170px)_1fr_minmax(140px,auto)] md:items-start md:gap-3"
      tabIndex={0}
    >
      {/* Integration Name */}
      <div className="font-semibold text-muted-foreground text-sm mb-2 md:mb-0">
        <div>{integration || "Unknown"}</div>
      </div>

      {/* Content Section - Status, Messages, Metrics */}
      <div className="flex flex-col gap-2 min-h-[24px]">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(log.status)}
          <span className="text-base md:text-sm text-foreground whitespace-pre-line">{msg || "No message"}</span>
        </div>
        
        {/* Metrics Section */}
        {hasMetrics && (
          <div className="flex flex-wrap gap-2 mt-1">
            {duration && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                Duration: {duration}
              </Badge>
            )}
            
            {totalListings > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                {totalListings} listing{totalListings !== 1 ? 's' : ''}
              </Badge>
            )}
            
            {totalBookings > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Timestamp + Retry Button */}
      <div className="flex flex-col items-end gap-2 mt-3 md:mt-0">
        <div className="text-xs text-muted-foreground text-right">
          {timestamp ? formatTimeAgo(timestamp) : "N/A"}
        </div>
        
        {showRetryButton && (
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-3 gap-1 w-full md:w-auto"
            onClick={() => onRetrySync && onRetrySync(log)}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <LoadingSpinner size="xsmall" /> Retrying...
              </>
            ) : (
              <>
                <RefreshCw size={14} /> Retry Sync
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
