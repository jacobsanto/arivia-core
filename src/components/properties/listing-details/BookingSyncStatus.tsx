
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { format, formatDistanceToNow } from 'date-fns';

interface BookingSyncStatusProps {
  lastSynced: string | null;
  progress?: number | null;
}

export const BookingSyncStatus: React.FC<BookingSyncStatusProps> = ({ 
  lastSynced, 
  progress 
}) => {
  if (!lastSynced && !progress) return null;
  
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      {progress !== null && progress !== undefined && progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Sync in progress</span>
            <span>{progress}%</span>
          </div>
          <Progress 
            value={progress}
            className="h-2"
            style={{ "--progress-indicator-color": "var(--primary)" } as React.CSSProperties}
          />
        </div>
      )}
      
      {lastSynced && (
        <div className="flex items-center gap-1">
          <span>Last synced: </span>
          <time 
            dateTime={lastSynced}
            title={format(new Date(lastSynced), 'PPpp')}
          >
            {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
          </time>
        </div>
      )}
    </div>
  );
};
