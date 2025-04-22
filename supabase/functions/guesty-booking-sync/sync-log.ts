
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

interface SyncLog {
  id: string;
  service: string;
  sync_type: string;
  status: 'in_progress' | 'completed' | 'error';
  start_time: string;
  message: string;
}

export async function createSyncLog(supabase: any, data: Partial<SyncLog>) {
  const { data: syncLog } = await supabase
    .from('sync_logs')
    .insert(data)
    .select()
    .single();
    
  return syncLog;
}

export async function updateSyncLog(
  supabase: any, 
  logId: string, 
  data: Partial<SyncLog> & { 
    end_time?: string;
    items_count?: number;
    sync_duration?: number;
    bookings_created?: number;
    bookings_updated?: number;
    bookings_deleted?: number;
  }
) {
  await supabase
    .from('sync_logs')
    .update(data)
    .eq('id', logId);
}

export async function updateIntegrationHealth(supabase: any, data: {
  last_synced?: string;
  status?: string;
  last_error?: string | null;
  remaining_requests?: number | null;
  rate_limit_reset?: string | null;
  request_count?: number;
}) {
  await supabase
    .from('integration_health')
    .upsert({
      provider: 'guesty',
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'provider'
    });
}
