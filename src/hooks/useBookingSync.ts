
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncProgress {
  currentListing: number;
  totalListings: number;
  bookingsSynced: number;
  estimatedTimeLeft: string;
}

interface SyncResult {
  success: boolean;
  bookings_synced?: number;
  listings_attempted?: number;
  listings_synced?: number;
  failed_listings?: string[];
  time_taken?: string;
  message?: string;
  error?: string;
}

export function useBookingSync({ onSyncComplete }: { onSyncComplete?: () => void } = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedListings, setFailedListings] = useState<string[]>([]);
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

  const syncBookings = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setError(null);
    setFailedListings([]);
    setSyncProgress(null);
    
    const startTime = Date.now();

    try {
      const response = await supabase.functions.invoke('guesty-booking-sync', {
        body: { syncAll: true }
      });

      if (response.error) throw new Error(response.error.message);

      const result = response.data as SyncResult;
      
      if (result.success) {
        if (result.failed_listings && result.failed_listings.length > 0) {
          // Partial success
          setFailedListings(result.failed_listings);
          const failMessage = `${result.bookings_synced} bookings synced, but ${result.failed_listings.length} of ${result.listings_attempted} listings failed`;
          toast.warning(failMessage, {
            description: "Some listings failed to sync. You can retry to sync the failed listings."
          });
        } else {
          // Full success
          toast.success(`${result.bookings_synced} bookings synced from ${result.listings_synced} listings`);
        }
        setSyncProgress(null);
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        throw new Error(result.message || 'Unknown error occurred');
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

  const syncBookingsForListing = async (listingId: string) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setError(null);
    setFailedListings([]);
    
    try {
      const response = await supabase.functions.invoke('guesty-booking-sync', {
        body: { listingId }
      });

      if (response.error) throw new Error(response.error.message);

      const result = response.data as SyncResult;
      
      if (result.success) {
        toast.success(`Successfully synced ${result.bookings_synced} bookings for listing`);
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
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
    failedListings,
    retryCountdown,
    syncBookings,
    syncBookingsForListing
  };
}
