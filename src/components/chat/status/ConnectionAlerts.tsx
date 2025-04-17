
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ChatError } from "@/hooks/chat/useChatError";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, WifiOff, RefreshCw } from "lucide-react";

interface ConnectionAlertsProps {
  isConnected: boolean;
  loadError: string | null;
  errors?: ChatError[];
  onDismissError?: (id: string) => void;
}

const ConnectionAlerts: React.FC<ConnectionAlertsProps> = ({
  isConnected,
  loadError,
  errors = [],
  onDismissError
}) => {
  if (isConnected && !loadError && errors.length === 0) return null;
  
  return (
    <div className="space-y-2 mb-4">
      {!isConnected && (
        <Alert variant="warning" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <div>
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                You are currently offline. Messages will be displayed but not sent to the server.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      {loadError && (
        <Alert variant="destructive" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {errors.map(error => (
        <Alert 
          key={error.id} 
          variant={
            error.type === 'offline' || error.type === 'connection' ? "warning" : "destructive"
          }
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <AlertTitle>
                {error.type === 'loading' ? 'Failed to Load Messages' :
                 error.type === 'sending' ? 'Failed to Send Message' :
                 error.type === 'reaction' ? 'Failed to Add Reaction' :
                 error.type === 'connection' ? 'Connection Error' :
                 error.type === 'offline' ? 'You are Offline' :
                 'Error'}
              </AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {error.retry && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => error.retry && error.retry()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onDismissError && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDismissError(error.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default ConnectionAlerts;
