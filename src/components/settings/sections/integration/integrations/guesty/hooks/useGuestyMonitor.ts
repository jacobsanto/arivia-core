
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MonitorData, RateLimitError } from "../types";

// Define a simple type for raw data from the database - only existing columns
interface RawApiUsageData {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  reset: string;
  timestamp: string;
}

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
        const { data: lastListingSyncData } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .eq("sync_type", "listings")
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();
        const lastListingSync: SyncLog | null = lastListingSyncData ? {
            id: lastListingSyncData.id,
            provider: lastListingSyncData.provider,
            sync_type: lastListingSyncData.sync_type,
            status: lastListingSyncData.status,
            start_time: lastListingSyncData.start_time,
            end_time: lastListingSyncData.end_time,
            message: lastListingSyncData.message,
            sync_duration_ms: lastListingSyncData.sync_duration_ms,
            webhook_event_type: lastListingSyncData.webhook_event_type
        } : null;

        // Get latest webhook sync
        const { data: lastBookingsWebhookData } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .eq("sync_type", "bookings")
          .eq("status", "completed")
          .not("webhook_event_type", "is", null)
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();
        const lastBookingsWebhook: SyncLog | null = lastBookingsWebhookData ? {
            id: lastBookingsWebhookData.id,
            provider: lastBookingsWebhookData.provider,
            sync_type: lastBookingsWebhookData.sync_type,
            status: lastBookingsWebhookData.status,
            start_time: lastBookingsWebhookData.start_time,
            end_time: lastBookingsWebhookData.end_time,
            message: lastBookingsWebhookData.message,
            sync_duration_ms: lastBookingsWebhookData.sync_duration_ms,
            webhook_event_type: lastBookingsWebhookData.webhook_event_type
        } : null;

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
        const { data: logsData, error: logsError } = await supabase
          .from("sync_logs")
          .select("*")
          .eq("provider", "guesty")
          .order("start_time", { ascending: false })
          .limit(10);
        const logs: SyncLog[] = logsData ? logsData.map(log => ({
            id: log.id,
            provider: log.provider,
            sync_type: log.sync_type,
            status: log.status,
            start_time: log.start_time,
            end_time: log.end_time,
            message: log.message,
            sync_duration_ms: log.sync_duration_ms,
            webhook_event_type: log.webhook_event_type
        })) : [];

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

        // Since the guesty_api_usage table doesn't have a status column,
        // we'll check for rate limits based on remaining being 0 or very low
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        // Fetch the API usage data - only existing columns
        const { data: rawRateLimitData, error: rateError } = await supabase
          .from("guesty_api_usage")
          .select("id, endpoint, rate_limit, remaining, reset, timestamp")
          .gte("timestamp", oneDayAgo.toISOString())
          .lte("remaining", 5) // Consider it rate limited if 5 or fewer requests remaining
          .order("timestamp", { ascending: false });
          
        // Create rate limit errors array
        const rateLimitErrors: RateLimitError[] = [];
        
        if (rawRateLimitData && Array.isArray(rawRateLimitData)) {
          for (const item of rawRateLimitData) {
            const error: RateLimitError = {
              id: item.id,
              endpoint: item.endpoint,
              rate_limit: item.rate_limit,
              remaining: item.remaining,
              reset: item.reset,
              timestamp: item.timestamp,
              status: 429 // Assume rate limited status
            };
            
            rateLimitErrors.push(error);
          }
        }
          
        const hasRecentRateLimits = rateLimitErrors.length > 0;

        return {
          isConnected: integrationHealth?.status === "connected",
          lastListingSync,
          lastBookingsWebhook,
          totalListings: totalListings || 0,
          totalBookings: totalBookings || 0,
          logs: logs,
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
