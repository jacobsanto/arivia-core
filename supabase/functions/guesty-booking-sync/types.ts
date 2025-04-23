
export interface SyncLogData {
  provider: string;
  sync_type: string;
  status: string;
  start_time: string;
  message?: string;
}

export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export interface RateLimitInfo {
  limit?: number;
  remaining: number;
  reset: number;
  rate_limit: number;
}
