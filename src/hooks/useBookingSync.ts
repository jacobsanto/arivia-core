
import { useState } from 'react';
import { guestyService } from '@/services/guesty/guesty.service';
import { toast } from 'sonner';

interface UseBookingSyncOptions {
  onSyncComplete?: () => void;
  listingId?: string;
}

export function useBookingSync({ onSyncComplete, listingId }: UseBookingSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);

  // Function to sync bookings for a specific listing
  const syncBookingsForListing = async (id: string) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsForListing(id);
      
      if (result.success) {
        toast.success('Bookings synchronized', { 
          description: result.message 
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        toast.error('Failed to sync bookings', { 
          description: result.error || 'Unknown error occurred' 
        });
      }
    } catch (error) {
      toast.error('Error synchronizing bookings', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  // Function to sync bookings for the current listing (if provided in options)
  const syncBookings = async () => {
    if (isSyncing) return;
    
    if (listingId) {
      return syncBookingsForListing(listingId);
    }
    
    setIsSyncing(true);
    try {
      const result = await guestyService.syncBookingsWithProgress();
      
      if (result.success) {
        toast.success('Bookings synchronized', { 
          description: result.message 
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        toast.error('Failed to sync bookings', { 
          description: result.error || 'Unknown error occurred' 
        });
      }
    } catch (error) {
      toast.error('Error synchronizing bookings', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  return {
    isSyncing,
    syncProgress,
    syncBookings,
    syncBookingsForListing
  };
}
