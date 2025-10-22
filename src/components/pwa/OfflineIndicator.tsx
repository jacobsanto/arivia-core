import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show brief "back online" message
      setTimeout(() => setShowOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 animate-slide-in-from-top md:left-auto md:right-4 md:w-96">
      <Alert variant={isOnline ? "default" : "destructive"} className="shadow-lg">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <AlertDescription>Back online</AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're offline. Some features may be limited.
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>
    </div>
  );
};
