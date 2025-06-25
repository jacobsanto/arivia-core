
import { ApiUsageRecord, EndpointUsage } from "../components/types";
import { formatDistanceToNow } from "date-fns";

export const getLatestUsageByEndpoint = (apiUsage: ApiUsageRecord[]): ApiUsageRecord[] => {
  if (!apiUsage) return [];
  const endpointMap = new Map<string, ApiUsageRecord>();
  
  apiUsage.forEach((usage) => {
    if (!endpointMap.has(usage.endpoint)) {
      endpointMap.set(usage.endpoint, usage);
    }
  });
  
  return Array.from(endpointMap.values());
};

export const getEndpointUsageCounts = (apiUsage: ApiUsageRecord[]): EndpointUsage[] => {
  if (!apiUsage) return [];
  
  // Calculate calls in the last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const recentCalls = apiUsage.filter((u) => new Date(u.timestamp) > oneDayAgo);
  
  // Count by endpoint
  const endpointCounts: Record<string, number> = {};
  const endpointStatuses: Record<string, { success: number; error: number; rateLimit: number }> = {};
  
  recentCalls.forEach((call) => {
    const endpoint = call.endpoint || 'unknown';
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    
    // Track statuses (for color coding)
    if (!endpointStatuses[endpoint]) {
      endpointStatuses[endpoint] = {
        success: 0,
        error: 0,
        rateLimit: 0
      };
    }
    
    if (call.status === 429) {
      endpointStatuses[endpoint].rateLimit++;
    } else if (call.status && call.status >= 400) {
      endpointStatuses[endpoint].error++;
    } else {
      endpointStatuses[endpoint].success++;
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({
      endpoint,
      count,
      status: endpointStatuses[endpoint]
    }))
    .sort((a, b) => (b.count as number) - (a.count as number));
};

export const formatEndpointName = (endpoint: string): string => {
  if (!endpoint) return "Unknown";
  return endpoint.replace(/^\/v\d+\//, "").replace(/-/g, " ");
};

export const calculateTimeToReset = (reset: string | null): string => {
  if (!reset) return "Unknown";
  
  try {
    const resetDate = new Date(reset);
    const now = new Date();
    
    if (resetDate <= now) return "Available now";
    
    return formatDistanceToNow(resetDate, { addSuffix: true });
  } catch (e) {
    return "Unknown";
  }
};

export const getTotalCalls24h = (apiUsage: ApiUsageRecord[]): number => {
  if (!apiUsage) return 0;
  
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return apiUsage.filter((u) => new Date(u.timestamp) > oneDayAgo).length;
};

export const getMostUsedEndpoint = (endpointUsage: EndpointUsage[]): string => {
  if (!endpointUsage.length) return "None";
  return formatEndpointName(endpointUsage[0].endpoint);
};

export const getLastRateLimitError = (rateLimitErrors: ApiUsageRecord[]): string => {
  if (!rateLimitErrors || rateLimitErrors.length === 0) return "None";
  return new Date(rateLimitErrors[0].timestamp).toLocaleString();
};
