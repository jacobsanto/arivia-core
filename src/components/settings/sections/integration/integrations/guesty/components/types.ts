
export interface ApiUsageRecord {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
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
