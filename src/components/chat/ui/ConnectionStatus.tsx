import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Wifi, WifiOff, X } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  errors: Array<{ id: string; message: string; type: string }>;
  onDismissError: (id: string) => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  status,
  errors,
  onDismissError
}) => {
  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    switch (status) {
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'disconnected':
      default:
        return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    if (isConnected) {
      return 'Connected to chat server';
    }
    
    switch (status) {
      case 'connecting':
        return 'Connecting to chat server...';
      case 'error':
        return 'Connection error occurred';
      case 'disconnected':
      default:
        return 'Disconnected from chat server';
    }
  };

  const shouldShowStatus = !isConnected || status === 'connecting';

  return (
    <div className="space-y-2">
      {/* Connection Status */}
      {shouldShowStatus && (
        <Alert className={`mb-4 ${
          isConnected 
            ? 'border-green-200 bg-green-50 text-green-800' 
            : 'border-yellow-200 bg-yellow-50 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription className="flex-1">
              {getStatusMessage()}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Error Messages */}
      {errors.map((error) => (
        <Alert key={error.id} variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex-1">
            {error.message}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismissError(error.id)}
            className="ml-2 h-auto p-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      ))}
    </div>
  );
};