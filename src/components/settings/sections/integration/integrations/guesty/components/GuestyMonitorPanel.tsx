
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCcw, Calendar, List, Info } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface GuestyMonitorPanelProps {
  isConnected: boolean;
  lastListingSync: any;
  lastBookingsWebhook: any;
  totalListings: number;
  totalBookings: number;
  avgSyncDuration: number|null;
  logs: Array<any>;
  isLoading?: boolean;
}

export const GuestyMonitorPanel: React.FC<GuestyMonitorPanelProps> = ({
  isConnected,
  lastListingSync,
  lastBookingsWebhook,
  totalListings,
  totalBookings,
  avgSyncDuration,
  logs,
  isLoading,
}) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Left: Connection/Last Syncs/Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm">Connection Status:</span>
          {isConnected ? (
            <Badge variant="success" className="gap-1">
              <Check className="h-3.5 w-3.5" /> Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <X className="h-3.5 w-3.5" /> Disconnected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Listings Sync:</span>
          <span className="text-xs">
            {lastListingSync?.start_time
              ? <>
                  {formatDistanceToNow(new Date(lastListingSync.start_time))} ago
                  <span className="text-muted-foreground ml-2">
                    {format(new Date(lastListingSync.start_time), "PPpp")}
                  </span>
                </>
              : "No sync log"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Last Booking Webhook:</span>
          <span className="text-xs">
            {lastBookingsWebhook?.start_time
              ? <>
                  {formatDistanceToNow(new Date(lastBookingsWebhook.start_time))} ago
                  <span className="text-muted-foreground ml-2">
                    {format(new Date(lastBookingsWebhook.start_time), "PPpp")}
                  </span>
                </>
              : "No webhooks received"}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Listings:&nbsp;</span>
            <span className="font-semibold">{totalListings ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Bookings:&nbsp;</span>
            <span className="font-semibold">{totalBookings ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg Listing Sync:&nbsp;</span>
            <span className="font-semibold">{avgSyncDuration !== null
                ? `${Math.round(avgSyncDuration/1000)}s`
                : "-"}</span>
          </div>
        </div>
      </div>
      {/* Right: Recent Sync Logs */}
      <div>
        <div className="font-semibold flex items-center gap-2 mb-2 text-sm">
          <List className="h-4 w-4" /> Recent Sync Logs
        </div>
        <div className="flex flex-col gap-1 max-h-52 overflow-auto pr-1">
          {logs.length === 0 && (
            <div className="text-xs text-muted-foreground p-2">No logs yet.</div>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className={`rounded px-2 py-1 text-xs border flex items-center gap-2
                ${log.status === "completed"
                  ? "border-green-200 bg-green-50"
                  : log.status === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"}
              `}
            >
              {log.status === "completed" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : log.status === "error" ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-semibold">
                {log.sync_type?.charAt(0).toUpperCase() + log.sync_type?.slice(1) || "-"}
              </span>
              <span>{log.message}</span>
              <span className="ml-auto text-muted-foreground">
                {log.start_time ? format(new Date(log.start_time), "PPpp") : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestyMonitorPanel;
