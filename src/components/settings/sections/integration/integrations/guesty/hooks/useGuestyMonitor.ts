
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MonitorData, RateLimitError } from "../types";

interface SyncLog {
  id: string;
  provider: string;
  sync_type: string;
  status: string;
  start_time: string;
  end_time?: string | null;
  message?: string | null;
  sync_duration_ms?: number | null;
  webhook_event_type?: string | null;
}

// Define a type for the raw API usage data from the database
interface RawApiUsageData {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
  status?: number;
  method?: string;
  listing_id?: string;
}

export function useGuestyMonitor() {
  return useQuery<MonitorData>({
    queryKey: ["guesty-monitor"],
    queryFn: async (): Promise<MonitorData> => {
      try {
        // Get Guesty connection status
        const { data: integrationHealth } = await supabase
          .from("integration_health")
          .select("*")
          .eq("provider", "guesty")
          .maybeSingle();

        // Get latest listing sync log
        const { data: lastListingSync } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .eq("sync_type", "listings")
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get latest webhook sync
        const { data: lastBookingsWebhook } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .eq("sync_type", "bookings")
          .eq("status", "completed")
          .not("webhook_event_type", "is", null)
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get total listings
        const { count: totalListings, error: listingsError } = await supabase
          .from("guesty_listings")
          .select("id", { count: "exact" })
          .eq("is_deleted", false)
          .eq("sync_status", "active");

        // Get total bookings
        const { count: totalBookings, error: bookingsError } = await supabase
          .from("guesty_bookings")
          .select("id", { count: "exact" })
          .neq("status", "cancelled");

        // Get recent sync logs for the sync activity timeline
        const { data: logs, error: logsError } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .order("start_time", { ascending: false })
          .limit(10);

        // Calculate average sync duration
        const { data: syncDurations, error: durationsError } = await supabase
          .from("sync_logs")
          .select("sync_duration_ms")
          .eq("provider", "guesty")
          .eq("status", "completed")
          .order("start_time", { ascending: false })
          .limit(20);

        let avgSyncDuration = null;
        if (syncDurations?.length && syncDurations.length > 0) {
          const validDurations = syncDurations
            .map(log => log.sync_duration_ms)
            .filter((duration): duration is number => duration !== null && duration > 0);
          
          if (validDurations.length > 0) {
            const total = validDurations.reduce((sum, duration) => sum + duration, 0);
            avgSyncDuration = total / validDurations.length;
          }
        }

        // Check recent rate limit errors
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const { data: rateLimitErrorsData } = await supabase
          .from("guesty_api_usage")
          .select("*")
          .eq("status", 429)
          .gte("timestamp", oneDayAgo.toISOString())
          .order("timestamp", { ascending: false });
          
        // Explicitly define the return type and use proper mapping
        const rateLimitErrors: RateLimitError[] = [];
        
        if (rateLimitErrorsData && Array.isArray(rateLimitErrorsData)) {
          rateLimitErrorsData.forEach((error: RawApiUsageData) => {
            rateLimitErrors.push({
              id: error.id,
              endpoint: error.endpoint,
              rate_limit: error.rate_limit,
              remaining: error.remaining,
              reset: error.reset,
              timestamp: error.timestamp,
              status: error.status || 429,
              method: error.method,
              listing_id: error.listing_id
            });
          });
        }
          
        const hasRecentRateLimits = rateLimitErrors.length > 0;

        return {
          isConnected: integrationHealth?.status === "connected",
          lastListingSync,
          lastBookingsWebhook,
          totalListings: totalListings || 0,
          totalBookings: totalBookings || 0,
          logs: logs || [],
          avgSyncDuration,
          hasRecentRateLimits,
          rateLimitErrors
        };
      } catch (error) {
        console.error("Error fetching Guesty monitor data:", error);
        throw error;
      }
    },
    refetchInterval: 60000, // 1 minute refresh
  });
}
