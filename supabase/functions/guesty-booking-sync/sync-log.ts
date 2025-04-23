
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { SyncLogData } from './types.ts';

export async function createSyncLog(
  supabase: any, 
  logData: SyncLogData
) {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert({
        provider: logData.provider,
        sync_type: logData.sync_type,
        status: logData.status,
        start_time: logData.start_time,
        message: logData.message
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating sync log:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Failed to create sync log', e);
    return null;
  }
}

export async function updateSyncLog(
  supabase: any,
  logId: string,
  updateData: {
    status: string;
    end_time: string;
    message?: string;
    entities_synced?: number;
    sync_duration_ms?: number;
    bookings_created?: number;
    bookings_updated?: number;
    bookings_deleted?: number;
  }
) {
  // Skip if logId is invalid
  if (!logId) {
    console.warn('Cannot update sync log: Invalid log ID');
    return;
  }

  try {
    const updatePayload = {
      status: updateData.status,
      end_time: updateData.end_time,
      message: updateData.message || '',
      entities_synced: updateData.entities_synced || 0,
      sync_duration_ms: updateData.sync_duration_ms || 0,
      bookings_created: updateData.bookings_created || 0,
      bookings_updated: updateData.bookings_updated || 0,
      bookings_deleted: updateData.bookings_deleted || 0
    };

    const { error } = await supabase
      .from('sync_logs')
      .update(updatePayload)
      .eq('id', logId);
    
    if (error) {
      console.error(`Error updating sync log ${logId}:`, error);
    }
  } catch (e) {
    console.error('Failed to update sync log', e);
  }
}

export async function updateIntegrationHealth(
  supabase: any,
  updateData: {
    status?: string;
    last_bookings_synced?: string;
    last_error?: string;
    is_rate_limited?: boolean;
  }
) {
  try {
    const { error } = await supabase
      .from('integration_health')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('provider', 'guesty');
    
    if (error) {
      console.error('Error updating integration health:', error);
    }
  } catch (e) {
    console.error('Failed to update integration health', e);
  }
}
