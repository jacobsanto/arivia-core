
export interface ApiUsage {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  timestamp: string;
}

export interface IntegrationHealthData {
  id: string;
  provider: string;
  status: string;
  last_synced?: string;
  last_bookings_synced?: string;
  is_rate_limited?: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncHistory {
  id: string;
  provider: string;
  entities_synced: number;
  sync_type: 'listings' | 'bookings';
  status: 'success' | 'partial' | 'failed';
  error_message?: string;
  created_at: string;
}
