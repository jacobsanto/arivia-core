
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApiUsage } from "../types";

export function useGuestyApiMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("usage");
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['guesty-health-check'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke<{
        success: boolean;
        health: HealthCheckResponse;
      }>('guesty-health-check');
      
      return data?.health;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchApiUsage()]);
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
    isRefreshing
  };
}

