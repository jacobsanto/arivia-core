
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ClipboardCheck, AlertTriangle, Clock, RefreshCcw } from "lucide-react";

interface SyncHistoryTabProps {
  recentSyncs: Array<{
    id: string;
    status: 'in_progress' | 'completed' | 'error';
    start_time: string;
    end_time?: string | null;
    duration?: number;
    message?: string;
    retry_count?: number;
  }>;
}

export const SyncHistoryTab: React.FC<SyncHistoryTabProps> = ({ recentSyncs }) => {
  const formatTime = (timeStr: string): string => {
    try {
      return format(new Date(timeStr), 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return 'Invalid date';
    }
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    
    // Convert to seconds for display
    const seconds = duration / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch(status) {
      case 'completed': return 'success';
      case 'error': return 'destructive';
      case 'in_progress': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <ClipboardCheck className="h-3.5 w-3.5" />;
      case 'error': return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'in_progress': return <Clock className="h-3.5 w-3.5 animate-pulse" />;
      default: return <RefreshCcw className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
      {recentSyncs?.length > 0 ? (
        recentSyncs.map(sync => (
          <div 
            key={sync.id} 
            className="text-xs p-2 rounded-md border mb-1"
          >
            <div className="flex justify-between">
              <span className="font-medium">
                {formatTime(sync.start_time)}
              </span>
              <Badge 
                variant={getBadgeVariant(sync.status)}
                className="text-[10px] h-5 flex items-center gap-1"
              >
                {getStatusIcon(sync.status)}
                <span>{sync.status}</span>
              </Badge>
            </div>
            {sync.duration !== undefined && (
              <div className="text-muted-foreground mt-1">
                Duration: {formatDuration(sync.duration)}
              </div>
            )}
            {(sync.retry_count !== undefined && sync.retry_count > 0) && (
              <div className="text-amber-600 mt-1">
                Retry count: {sync.retry_count}
              </div>
            )}
            {sync.message && (
              <div className="text-muted-foreground mt-1 line-clamp-1">
                {sync.message}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No sync history available
        </div>
      )}
    </div>
  );
};
