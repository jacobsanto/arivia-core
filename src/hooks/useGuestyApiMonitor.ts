
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ApiUsageData {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
}

interface UsageMetrics {
  total24h: number;
  mostUsed: string | null;
  mostUsedCount: number;
  lastRateLimitError: string | null;
}

interface HealthData {
  id?: string;
  provider: string;
  status: string;
  last_synced?: string;
  last_error?: string;
  updated_at: string;
}

export function useGuestyApiMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get API usage data
  const { data: apiUsage, isLoading, refetch } = useQuery({
    queryKey: ['guesty-api-usage'],
    queryFn: async (): Promise<ApiUsageData[]> => {
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return (data || []) as ApiUsageData[];
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Get rate limit situations in the last 24 hours
  const { data: rateLimitErrors } = useQuery({
    queryKey: ['guesty-rate-limit-errors'],
    queryFn: async (): Promise<ApiUsageData[]> => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .lte('remaining', 5) // Consider rate limited if 5 or fewer requests remaining
        .gte('timestamp', oneDayAgo.toISOString())
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      return (data || []) as ApiUsageData[];
    },
    refetchInterval: 60000, // 1 minute
  });

  // Get API health status
  const { data: healthData } = useQuery({
    queryKey: ['guesty-api-health'],
    queryFn: async (): Promise<HealthData | null> => {
      const { data, error } = await supabase
        .from('integration_health')
        .select('*')
        .eq('provider', 'guesty')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      return data as HealthData | null;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate usage metrics
  const getUsageMetrics = (): UsageMetrics => {
    if (!apiUsage) return { total24h: 0, mostUsed: null, mostUsedCount: 0, lastRateLimitError: null };
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recent = apiUsage.filter(u => new Date(u.timestamp) > oneDayAgo);
    
    // Count by endpoint
    const endpointCounts: Record<string, number> = {};
    recent.forEach(call => {
      const endpoint = call.endpoint || 'unknown';
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    // Find most used endpoint
    let mostUsed: string | null = null;
    let maxCount = 0;
    Object.entries(endpointCounts).forEach(([endpoint, count]) => {
      if (count > maxCount) {
        mostUsed = endpoint;
        maxCount = count;
      }
    });
    
    return {
      total24h: recent.length,
      mostUsed,
      mostUsedCount: maxCount,
      lastRateLimitError: rateLimitErrors && rateLimitErrors.length > 0 
        ? rateLimitErrors[0].timestamp 
        : null
    };
  };

  // Check for rate limit alerts
  const checkRateLimitAlert = (): boolean => {
    if (!rateLimitErrors || !rateLimitErrors.length) return false;
    
    const mostRecent = new Date(rateLimitErrors[0].timestamp);
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    return mostRecent > fiveMinutesAgo;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("API usage data refreshed");
    } catch (error) {
      toast.error("Failed to refresh API data");
      console.error("Error refreshing API usage data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    apiUsage,
    rateLimitErrors,
    healthData,
    isLoading,
    isRefreshing,
    metrics: getUsageMetrics(),
    hasRecentRateLimitAlert: checkRateLimitAlert(),
    refresh: handleRefresh
  };
}
