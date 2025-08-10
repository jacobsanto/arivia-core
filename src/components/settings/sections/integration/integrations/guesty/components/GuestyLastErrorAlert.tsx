
import React from "react";
import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GuestyLastErrorAlertProps {
  lastSyncErrorLog: {
    message: string;
    sync_type: string;
    start_time: string;
  } | null;
}

const GuestyLastErrorAlert: React.FC<GuestyLastErrorAlertProps> = ({
  lastSyncErrorLog,
}) => {
  if (!lastSyncErrorLog) return null;

  return (
    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Last Sync Error</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p className="font-medium">{lastSyncErrorLog.sync_type}</p>
            <p className="mt-1">{lastSyncErrorLog.message}</p>
            <p className="mt-1 text-xs text-amber-600">
              {formatDistanceToNow(new Date(lastSyncErrorLog.start_time), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestyLastErrorAlert;
