
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
        provider: logData.service,
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
    items_count?: number;
    sync_duration?: number;
    bookings_created?: number;
    bookings_updated?: number;
    bookings_deleted?: number;
  }
) {
  try {
    const { error } = await supabase
      .from('sync_logs')
      .update({
        status: updateData.status,
        end_time: updateData.end_time,
        message: updateData.message,
        entities_synced: updateData.items_count || 0,
        sync_duration_ms: updateData.sync_duration || 0,
        bookings_created: updateData.bookings_created || 0,
        bookings_updated: updateData.bookings_updated || 0,
        bookings_deleted: updateData.bookings_deleted || 0
      })
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

