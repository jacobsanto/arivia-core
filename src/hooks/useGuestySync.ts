
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncProgress {
  currentListing: number;
  totalListings: number;
  bookingsSynced: number;
  estimatedTimeLeft: string;
}

export function useGuestySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (retryCountdown !== null && retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const calculateEstimatedTime = (current: number, total: number, startTime: number) => {
    const elapsed = Date.now() - startTime;
    const avgTimePerListing = elapsed / current;
    const remainingListings = total - current;
    const estimatedMs = avgTimePerListing * remainingListings;
    
    const minutes = Math.floor(estimatedMs / 60000);
    const seconds = Math.floor((estimatedMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const sync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setError(null);
    setSyncProgress(null);
    
    const startTime = Date.now();

    try {
      const response = await supabase.functions.invoke('guesty-booking-sync', {
        body: { fullSync: true }
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      
      if (data.success) {
        toast.success(`${data.bookings_synced} bookings synced from ${data.listings_count} listings`);
        setSyncProgress(null);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      setRetryCountdown(10);
      toast.error('Sync failed', {
        description: errorMessage
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncProgress,
    error,
    retryCountdown,
    sync
  };
}
