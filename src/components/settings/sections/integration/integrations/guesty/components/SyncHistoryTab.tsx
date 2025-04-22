
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SyncHistoryTabProps {
  recentSyncs: Array<{
    id: string;
    status: 'in_progress' | 'completed' | 'error';
    start_time: string;
    duration?: number;
    message?: string;
    retry_count?: number;
  }>;
}

export const SyncHistoryTab: React.FC<SyncHistoryTabProps> = ({ recentSyncs }) => {
  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
      {recentSyncs?.map(sync => (
        <div 
          key={sync.id} 
          className="text-xs p-2 rounded-md border mb-1"
        >
          <div className="flex justify-between">
            <span className="font-medium">
              {format(new Date(sync.start_time), 'MMM d, h:mm a')}
            </span>
            <Badge 
              variant={
                sync.status === 'completed' ? 'success' : 
                sync.status === 'error' ? 'destructive' : 
                'outline'
              }
              className="text-[10px] h-5"
            >
              {sync.status}
            </Badge>
          </div>
          {sync.duration && (
            <div className="text-muted-foreground mt-1">
              Duration: {(sync.duration / 1000).toFixed(1)}s
            </div>
          )}
          {sync.retry_count > 0 && (
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
      ))}
    </div>
  );
};

