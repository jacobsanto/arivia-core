
export async function updateSyncLog(
  supabase: any,
  logId: string,
  updateData: {
    status: string;
    end_time: string;
    message: string;
    entities_synced: number;
    sync_duration_ms: number;
    bookings_created?: number;
    bookings_updated?: number;
    bookings_deleted?: number;
    failed_listings?: string[];
  }
) {
  // Skip if logId is invalid
  if (!logId) {
    console.warn('[GuestySync] Cannot update sync log: Invalid log ID');
    return;
  }

  try {
    const updatePayload = {
      status: updateData.status,
      end_time: updateData.end_time,
      message: updateData.message,
      entities_synced: updateData.entities_synced,
      sync_duration_ms: updateData.sync_duration_ms,
      bookings_created: updateData.bookings_created || 0,
      bookings_updated: updateData.bookings_updated || 0,
      bookings_deleted: updateData.bookings_deleted || 0,
      failed_listings: updateData.failed_listings || [],
      sync_type: 'bookings'
    };

    const { error } = await supabase
      .from('sync_logs')
      .update(updatePayload)
      .eq('id', logId);
    
    if (error) {
      console.error(`[GuestySync] Error updating sync log ${logId}:`, error);
    }
  } catch (e) {
    console.error('[GuestySync] Failed to update sync log:', e);
  }
}
