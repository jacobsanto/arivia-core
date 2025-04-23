
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
      return response.data as GuestySyncResponse;
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
    status: 'connected' | 'error' | 'disconnected'
  }> {
    try {
      const { data: inProgressSyncs, error: syncError } = await supabase
        .from('sync_logs')
        .select('id')
        .eq('status', 'in_progress')
        .eq('service', 'guesty')
        .limit(1);

      if (syncError) throw syncError;

      const { data: lastSync, error: lastSyncError } = await supabase
        .from('sync_logs')
        .select('start_time')
        .eq('status', 'completed')
        .eq('service', 'guesty')
        .order('start_time', { ascending: false })
        .limit(1);

      if (lastSyncError) throw lastSyncError;

      const { data: health, error: healthError } = await supabase
        .from('integration_health')
        .select('status, last_synced')
        .eq('provider', 'guesty')
        .single();

      if (healthError && healthError.code !== 'PGRST116') throw healthError;

      const connectionStatus: 'connected' | 'error' | 'disconnected' =
        health?.status === 'connected' ? 'connected' :
        health?.status === 'error' ? 'error' :
        'disconnected';

      return {
        lastSync: (lastSync && lastSync.length > 0) ? lastSync[0].start_time : health?.last_synced || null,
        isInProgress: (inProgressSyncs && inProgressSyncs.length > 0),
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
