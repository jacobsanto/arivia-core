
export interface IntegrationHealthData {
  id?: string;
  provider: string;
  status: string;
  last_synced?: string;
  last_bookings_synced?: string;
  is_rate_limited?: boolean;
  last_error?: string;
  created_at?: string;
  updated_at: string;
  remaining_requests?: number;
  rate_limit_reset?: string;
  request_count?: number;
  endpoint_stats?: Record<string, any>;
  last_successful_endpoint?: string;
}
