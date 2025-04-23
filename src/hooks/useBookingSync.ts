
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseBookingSyncProps {
  onSyncComplete?: () => void;
}

export function useBookingSync({ onSyncComplete }: UseBookingSyncProps = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedListings, setFailedListings] = useState<string[]>([]);

  const handleSyncError = useCallback((error: any, listingId?: string) => {
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if we hit rate limits
    if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('too many requests')) {
      const retryAfterMatch = errorMessage.match(/(\d+)\s*seconds/i);
      const retrySeconds = retryAfterMatch ? parseInt(retryAfterMatch[1], 10) : 60;
      
      toast.error('Rate limit exceeded', {
        description: `The Guesty API rate limit was reached. Please try again in ${retrySeconds} seconds.`,
        duration: 10000,
      });
      
      if (listingId) {
        setFailedListings(prev => [...prev, listingId]);
      }
      return;
    }
    
    // Handle other errors
    toast.error('Sync failed', {
      description: errorMessage
    });
  }, []);

  // Sync all bookings
  const syncBookings = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setFailedListings([]);
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('guesty-booking-sync', {
        method: 'POST',
        body: { syncAll: true }
      });

      if (error) throw error;
      
      const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (data.success) {
        toast.success('Bookings synced successfully', {
          description: `Synced ${data.bookingsSynced} bookings across ${data.processedCount} listings in ${timeElapsed}s`
        });
        
        // Record any failed listings
        if (data.results) {
          const failed = data.results
            .filter((r: any) => !r.success)
            .map((r: any) => r.listingId);
          
          setFailedListings(failed);
          
          if (failed.length > 0) {
            toast.warning(`${failed.length} listings failed to sync`, {
              description: 'Some listings could not be synced. Try again later.'
            });
          }
        }
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        throw new Error(data.error || 'Unknown error during sync');
      }
    } catch (err: any) {
      handleSyncError(err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onSyncComplete, handleSyncError]);

  // Sync bookings for a specific listing
  const syncBookingsForListing = useCallback(async (listingId: string) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('guesty-booking-sync', {
        method: 'POST',
        body: { listingId }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('Bookings synced', {
          description: `Synced ${data.bookingsSynced} bookings for this property`
        });
        
        // Remove this listing from failed listings if it was there
        setFailedListings(prev => prev.filter(id => id !== listingId));
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        throw new Error(data.error || 'Unknown error during sync');
      }
    } catch (err: any) {
      handleSyncError(err, listingId);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onSyncComplete, handleSyncError]);

  return {
    isSyncing,
    syncBookings,
    syncBookingsForListing,
    failedListings
  };
}
