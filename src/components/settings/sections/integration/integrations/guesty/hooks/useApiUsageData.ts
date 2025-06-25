

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApiUsageRecord } from "../components/types";

export const useApiUsageData = () => {
  // Get API usage data - last 50 records
  const { data: apiUsage, isLoading, refetch } = useQuery<ApiUsageRecord[], Error>({
    queryKey: ["guesty-api-usage"],
    queryFn: async (): Promise<ApiUsageRecord[]> => {
      const { data, error } = await supabase
        .from("guesty_api_usage")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as ApiUsageRecord[];
    },
    refetchInterval: 10000,
  });

  // Get rate limit errors in the last 24 hours
  const { data: rateLimitErrors } = useQuery<ApiUsageRecord[], Error>({
    queryKey: ["guesty-rate-limit-errors"],
    queryFn: async (): Promise<ApiUsageRecord[]> => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data, error } = await supabase
        .from("guesty_api_usage")
        .select("*")
        .eq("status", 429)
        .gte("timestamp", oneDayAgo.toISOString())
        .order("timestamp", { ascending: false });
        
      if (error) throw error;
      return (data || []) as ApiUsageRecord[];
    },
    refetchInterval: 60000,  // 1 minute
  });

  return {
    apiUsage,
    rateLimitErrors,
    isLoading,
    refetch
  };
};

