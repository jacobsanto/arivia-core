
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatTimeAgo } from "@/services/dataFormatService";
import { Check, X, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SyncLog } from "./useSyncLogs";

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
  const timestamp = log.end_time || log.start_time || log.created_at;
  const msg = log.error_message || log.message;
  
  // Calculate duration if possible
  const duration = log.sync_duration 
    ? formatDuration(log.sync_duration)
    : (log.start_time && log.end_time)
      ? formatDuration(new Date(log.end_time).getTime() - new Date(log.start_time).getTime())
      : null;
  
  // Calculate total synced items
  const totalListings = (log.listings_created || 0) + (log.listings_updated || 0) + (log.listings_deleted || 0);
  const totalBookings = (log.bookings_created || 0) + (log.bookings_updated || 0) + (log.bookings_deleted || 0);
  const hasMetrics = duration || totalListings > 0 || totalBookings > 0 || log.items_count;
  
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
      {/* Integration Name + Listing ID */}
      <div className="font-semibold text-muted-foreground text-sm mb-2 md:mb-0">
        <div>{log.service ?? "Unknown"}</div>
        {log.listing_id && (
          <div className="text-xs mt-1">ID: {log.listing_id}</div>
        )}
        {log.sync_type && (
          <div className="text-xs mt-1 opacity-70">Type: {log.sync_type}</div>
        )}
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
            
            {log.items_count !== undefined && log.items_count > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                {log.items_count} item{log.items_count !== 1 ? 's' : ''}
              </Badge>
            )}
            
            {totalListings > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                {totalListings} listing{totalListings !== 1 ? 's' : ''}
                {log.listings_created ? ` (+${log.listings_created})` : ''}
                {log.listings_updated ? ` (~${log.listings_updated})` : ''}
                {log.listings_deleted ? ` (-${log.listings_deleted})` : ''}
              </Badge>
            )}
            
            {totalBookings > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/30">
                {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
                {log.bookings_created ? ` (+${log.bookings_created})` : ''}
                {log.bookings_updated ? ` (~${log.bookings_updated})` : ''}
                {log.bookings_deleted ? ` (-${log.bookings_deleted})` : ''}
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
