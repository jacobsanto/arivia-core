
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { SyncStatus } from './utils.ts';

// Update sync log with error information
export async function updateSyncLogError(
  supabase: any, 
  syncLogId: string, 
  errorMessage: string, 
  startTime: number, 
  retryCount?: number
): Promise<void> {
  try {
    await supabase
      .from('sync_logs')
      .update({
        status: 'error',
        end_time: new Date().toISOString(),
        message: errorMessage,
        sync_type: 'full_sync',
        sync_duration: Date.now() - startTime,
        retry_count: retryCount
      })
      .eq('id', syncLogId);
  } catch (err) {
    console.error('Failed to update sync log with error details:', err);
  }
}

// Create a new sync log entry
export async function createSyncLog(
  supabase: any, 
  retryCount: number, 
  nextRetryTime: Date
): Promise<{ data: any; error: any }> {
  return await supabase
    .from('sync_logs')
    .insert({
      service: 'guesty',
      sync_type: 'full_sync',
      status: 'in_progress',
      start_time: new Date().toISOString(),
      message: 'Starting Guesty full sync process',
      retry_count: retryCount,
      next_retry_time: nextRetryTime.toISOString()
    })
    .select()
    .single();
}

// Update sync log with success information
export async function updateSyncLogSuccess(
  supabase: any,
  syncLogId: string,
  startTime: number,
  listings: number,
  totalBookingsSynced: number,
  failedBookings: number
): Promise<void> {
  try {
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        items_count: listings + totalBookingsSynced,
        sync_duration: Date.now() - startTime,
        message: `Successfully synced ${listings} listings and ${totalBookingsSynced} bookings${
          failedBookings > 0 ? ` (${failedBookings} booking syncs failed)` : ''
        }`,
        sync_type: 'full_sync',
        retry_count: 0
      })
      .eq('id', syncLogId);
  } catch (err) {
    console.error('Failed to update sync log:', err);
  }
}
