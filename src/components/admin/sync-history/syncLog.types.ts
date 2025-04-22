
export interface SyncLog {
  id: string;
  service: string;
  sync_type?: string | null;
  status?: string | null;
  message?: string | null;
  error_message?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string | null;
  listing_id?: string | null;
  sync_duration?: number | null;
  bookings_created?: number | null;
  bookings_updated?: number | null;
  bookings_deleted?: number | null;
  listings_created?: number | null;
  listings_updated?: number | null;
  listings_deleted?: number | null;
  items_count?: number | null;
}

export interface UseSyncLogsParams {
  pageSize: number;
  status: string | null;
  integration: string | null;
  listingId?: string | null;
}

export interface RetrySyncOptions {
  logId: string;
  service: string;
  syncType?: string | null;
}
