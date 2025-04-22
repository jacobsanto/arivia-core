
export interface IntegrationHealthData {
  status?: string;
  last_synced?: string;
  last_bookings_synced?: string;
  last_error?: string;
  provider: string;
  updated_at?: string;
  remaining_requests?: number;
  rate_limit_reset?: string;
  request_count?: number;
  is_rate_limited?: boolean;
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

export interface ApiUsage {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
}
