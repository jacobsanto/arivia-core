
// @ts-nocheck

import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApiUsage, IntegrationHealthData } from "../types";

// Define interface for health check response
interface HealthCheckResponse {
  status: string;
  lastSynced: string | null;
  lastError: string | null;
  isRateLimited: boolean;
  remainingRequests: number | null;
  nextSyncTime: string | null;
  quotaUsage: Record<string, {
    total: number;
    remaining: number;
    limit: number;
  }>;
  recentSyncs: Array<{
    id: string;
    status: 'in_progress' | 'completed' | 'error';
    start_time: string;
    end_time: string | null;
    duration?: number;
    message?: string;
    retry_count?: number;
    next_retry_time?: string | null;
  }>;
}

export function useGuestyApiMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("usage");
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['guesty-health-check'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        health: HealthCheckResponse;
      }>('guesty-health-check');
      
      if (error) throw error;
      if (!data) throw new Error('No data returned from health check');
      if (!data.success) throw new Error(data.health?.lastError || 'Health check failed');
      
      return data.health;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2, // Retry twice on failure
  });
  
  const { data: apiUsage, isLoading: isLoadingUsage, refetch: refetchApiUsage } = useQuery({
    queryKey: ['guesty-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data as ApiUsage[];
    },
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch({ cancelRefetch: true }), 
        refetchApiUsage({ cancelRefetch: true })
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    data,
    apiUsage,
    isLoading: isLoading || isRefreshing,
    error,
    activeTab,
    setActiveTab,
    handleRefresh,
    isRefreshing,
    isLoadingUsage
  };
}
