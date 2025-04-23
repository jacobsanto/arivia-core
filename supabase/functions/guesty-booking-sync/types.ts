
export interface SyncLogData {
  provider: string;
  sync_type: string;
  status: string;
  start_time: string;
  message: string;
}

export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
  processedCount?: number;
  moreListingsToProcess?: boolean;
  executionTime?: number;
}

export interface BookingData {
  id: string;
  listing_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  last_synced: string;
  raw_data: any;
}
