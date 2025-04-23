
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "sonner";

export function useGuestyApiMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Get API usage data
  const { data: apiUsage, isLoading, refetch } = useQuery({
    queryKey: ['guesty-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data;
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Get rate limit errors in the last 24 hours
  const { data: rateLimitErrors } = useQuery({
    queryKey: ['guesty-rate-limit-errors'],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .eq('status', 429)
        .gte('timestamp', oneDayAgo.toISOString())
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // 1 minute
  });

  // Get API health status
  const { data: healthData } = useQuery({
    queryKey: ['guesty-api-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_health')
        .select('*')
        .eq('provider', 'guesty')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate usage metrics
  const getUsageMetrics = () => {
    if (!apiUsage) return { total24h: 0, mostUsed: null, lastRateLimitError: null };
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recent = apiUsage.filter(u => new Date(u.timestamp) > oneDayAgo);
    
    // Count by endpoint
    const endpointCounts = {};
    recent.forEach(call => {
      const endpoint = call.endpoint || 'unknown';
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    // Find most used endpoint
    let mostUsed = null;
    let maxCount = 0;
    Object.entries(endpointCounts).forEach(([endpoint, count]) => {
      if ((count as number) > maxCount) {
        mostUsed = endpoint;
        maxCount = count as number;
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
  const checkRateLimitAlert = () => {
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
