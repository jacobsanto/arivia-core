
import { supabase } from '@/integrations/supabase/client';
import { GuestySyncResponse } from './guesty.types';

export const guestySyncService = {
  async ensureValidToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('guesty-health-check', {
        method: 'POST',
      });
      if (error) throw error;
      return data?.valid || false;
    } catch (error) {
      console.error('Error checking Guesty token:', error);
      throw error;
    }
  },

  async syncListings(): Promise<GuestySyncResponse> {
    try {
      const response = await supabase.functions.invoke('guesty-sync', {
        method: 'POST',
      });

      if (response.error) throw new Error(response.error.message);
      return {
        success: true,
        message: response.data?.message || 'Sync completed successfully',
        listingsCount: response.data?.listingsCount || 0,
        bookingsSynced: response.data?.bookingsSynced || 0
      };
    } catch (error) {
      console.error('Error syncing Guesty listings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error syncing listings'
      };
    }
  },

  async getSyncStatus(): Promise<{
    lastSync: string | null;
    isInProgress: boolean;
    status: 'connected' | 'error' | 'disconnected';
  }> {
    try {
      const [inProgressSyncs, lastCompletedSync, healthStatus] = await Promise.all([
        supabase
          .from('sync_logs')
          .select('id')
          .eq('status', 'in_progress')
          .eq('provider', 'guesty')
          .limit(1),
        
        supabase
          .from('sync_logs')
          .select('start_time')
          .eq('status', 'completed')
          .eq('provider', 'guesty')
          .order('start_time', { ascending: false })
          .limit(1),
        
        supabase
          .from('integration_health')
          .select('status, last_synced')
          .eq('provider', 'guesty')
          .single()
      ]);

      if (inProgressSyncs.error) throw inProgressSyncs.error;
      if (lastCompletedSync.error) throw lastCompletedSync.error;

      const lastSyncTime = lastCompletedSync.data?.[0]?.start_time || healthStatus.data?.last_synced || null;
      const isInProgress = (inProgressSyncs.data?.length || 0) > 0;

      const connectionStatus = healthStatus.data?.status === 'connected' ? 'connected' :
                             healthStatus.data?.status === 'error' ? 'error' :
                             'disconnected';

      return {
        lastSync: lastSyncTime,
        isInProgress,
        status: connectionStatus
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: null,
        isInProgress: false,
        status: 'error'
      };
    }
  }
};

