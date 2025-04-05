
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { offlineManager } from '@/utils/offlineManager';
import { toast } from 'sonner';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(offlineManager.hasUnsyncedData());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Check for pending sync data
    const checkPendingSync = () => {
      setHasPendingSync(offlineManager.hasUnsyncedData());
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check for pending sync data every 10 seconds
    const intervalId = setInterval(checkPendingSync, 10000);
    
    // Update once when component mounts
    checkPendingSync();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  const handleSyncNow = () => {
    if (!isOnline) {
      toast.error("You're offline", {
        description: "Can't sync while offline. Please connect to the internet first."
      });
      return;
    }
    
    offlineManager.syncOfflineData().then(() => {
      // Update sync status after sync completes
      setHasPendingSync(offlineManager.hasUnsyncedData());
    });
  };

  if (isOnline && !hasPendingSync) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg shadow-lg px-3 py-2 ${
      isOnline ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span className="text-sm font-medium">
            {hasPendingSync ? 'Unsynced Changes' : 'Online'}
          </span>
          {hasPendingSync && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-7 bg-amber-200 hover:bg-amber-300 text-amber-800" 
              onClick={handleSyncNow}
            >
              Sync Now
            </Button>
          )}
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">Offline Mode</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
