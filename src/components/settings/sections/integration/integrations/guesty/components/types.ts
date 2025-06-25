
export interface ApiUsageRecord {
  id: string;
  endpoint: string;
  method?: string;
  status?: number;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
  listing_id?: string;
}

export interface EndpointUsage {
  endpoint: string;
  count: number;
  status: {
    success: number;
    error: number;
    rateLimit: number;
  };
}
