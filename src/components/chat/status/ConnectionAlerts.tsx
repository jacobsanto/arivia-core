
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ConnectionAlertsProps {
  isConnected: boolean;
  loadError: string | null;
}

const ConnectionAlerts: React.FC<ConnectionAlertsProps> = ({
  isConnected,
  loadError
}) => {
  if (isConnected && !loadError) return null;
  
  return (
    <>
      {!isConnected && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently offline. Messages will be displayed but not sent to the server.
          </AlertDescription>
        </Alert>
      )}
      
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ConnectionAlerts;
