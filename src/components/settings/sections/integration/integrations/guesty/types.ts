
export interface ApiUsage {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  timestamp: string;
  reset?: string;
}

export interface IntegrationHealthData {
  id: string;
  provider: string;
  status: string;
  last_synced?: string;
  last_bookings_synced?: string;
  is_rate_limited?: boolean;
  last_error?: string;  // Adding this to match existing code usage
  error_message?: string;
  created_at: string;
  updated_at: string;
  remaining_requests?: number;  // Adding these fields to match existing code usage
  rate_limit_reset?: string;
  request_count?: number;
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

export interface GuestyStatusBadgeProps {
  status?: string;
}

export interface GuestySyncControlsProps {
  onTest: () => void;
  onSync: () => void;
  onSyncBookings?: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isSyncingBookings?: boolean;
  isConnected: boolean;
}
