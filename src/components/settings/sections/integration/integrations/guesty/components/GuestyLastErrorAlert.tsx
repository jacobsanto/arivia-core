
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logs } from "lucide-react";
import { format } from "date-fns";

interface GuestyLastErrorAlertProps {
  lastSyncErrorLog: any;
}

const GuestyLastErrorAlert: React.FC<GuestyLastErrorAlertProps> = ({
  lastSyncErrorLog
}) => {
  if (!lastSyncErrorLog) return null;
  return (
    <Alert variant="destructive" className="mt-4 border-2 border-red-400 bg-red-50">
      <Logs className="h-4 w-4" />
      <AlertTitle className="flex gap-2 items-center">
        Sync Failure: <span className="text-xs font-normal text-muted-foreground">{lastSyncErrorLog.sync_type && lastSyncErrorLog.sync_type.replace("_", " ")}</span>
        <span className="ml-1 text-xs">{lastSyncErrorLog.start_time ? format(new Date(lastSyncErrorLog.start_time), "PPpp") : null}</span>
      </AlertTitle>
      <AlertDescription className="text-red-800 font-mono" data-testid="last-sync-error-log">
        {lastSyncErrorLog.message}
      </AlertDescription>
    </Alert>
  );
};

export default GuestyLastErrorAlert;
