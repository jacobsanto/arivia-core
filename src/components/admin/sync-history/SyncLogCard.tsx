
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/services/dataFormatService";
import { Check, X } from "lucide-react";

// Infer the shape, adjust field names as per sync_logs table
interface SyncLogCardProps {
  log: {
    id: string;
    service: string;
    sync_type?: string | null;
    status?: string | null;
    message?: string | null;
    error_message?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    created_at?: string | null;
  };
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

export const SyncLogCard: React.FC<SyncLogCardProps> = ({ log }) => {
  const timestamp = log.end_time || log.start_time || log.created_at;
  const msg = log.error_message || log.message;
  return (
    <div
      className="bg-card border rounded-xl px-4 py-4 shadow-sm flex flex-col transition hover:ring-2 hover:ring-primary/20 focus:outline-none min-h-[44px]
      md:grid md:grid-cols-[minmax(120px,170px)_1fr_minmax(140px,auto)] md:items-center md:gap-3"
      tabIndex={0}
      role="button"
      style={{ minHeight: 44 }}
    >
      {/* Integration Name */}
      <div className="font-semibold text-muted-foreground text-sm mb-1 md:mb-0">{log.service ?? "Unknown"}</div>

      {/* Message + status */}
      <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
        {getStatusBadge(log.status)}
        <span className="text-base md:text-sm text-foreground whitespace-pre-line">{msg || "No message"}</span>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-2 md:mt-0 md:text-right">
        {timestamp ? formatTimeAgo(timestamp) : "N/A"}
      </div>
    </div>
  );
};
