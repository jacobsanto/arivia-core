
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getGuestyMonitorData = async () => {
  // Stats queries (parallel)
  const [
    listingsRes,
    bookingsRes,
    logsRes,
    lastListingSyncRes,
    lastWebhookSyncRes
  ] = await Promise.all([
    supabase.from("guesty_listings").select("id", { count: "exact", head: true }),
    supabase.from("guesty_bookings").select("id", { count: "exact", head: true }),
    supabase.from("sync_logs")
      .select("id,status,message,sync_type,start_time,end_time,sync_duration", { count: "exact" })
      .order("start_time", { ascending: false })
      .limit(10),
    supabase.from("sync_logs")
      .select("id,start_time,status", { count: 1 })
      .eq("sync_type", "listings")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("sync_logs")
      .select("id,start_time,status", { count: 1 })
      .eq("sync_type", "webhook")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const totalListings = listingsRes.count || 0;
  const totalBookings = bookingsRes.count || 0;

  // Find avg sync duration from logs of type 'listings'
  const listingLogsRes = await supabase.from("sync_logs")
    .select("sync_duration")
    .eq("sync_type", "listings")
    .is("sync_duration", null, false)
    .order("start_time", { ascending: false })
    .limit(30);
  const listingDurations = (listingLogsRes.data || [])
    .map((r: any) => r.sync_duration)
    .filter((d: any) => typeof d === "number" && d > 0);
  const avgSyncDuration = listingDurations.length
    ? listingDurations.reduce((sum, d) => sum + d, 0) / listingDurations.length
    : null;

  // Connection status: last successful listing sync within past 12h
  const lastListingSync = lastListingSyncRes.data
    ? lastListingSyncRes.data
    : Array.isArray(lastListingSyncRes.data) && lastListingSyncRes.data.length
    ? lastListingSyncRes.data[0]
    : null;

  const isConnected = lastListingSync
    ? lastListingSync.status === "completed" &&
      new Date(lastListingSync.start_time).getTime() >=
        Date.now() - 12 * 3600 * 1000
    : false;

  const logs = logsRes.data || [];
  const lastBookingsWebhook = lastWebhookSyncRes.data
    ? lastWebhookSyncRes.data
    : Array.isArray(lastWebhookSyncRes.data) && lastWebhookSyncRes.data.length
    ? lastWebhookSyncRes.data[0]
    : null;

  return {
    isConnected,
    lastListingSync,
    lastBookingsWebhook,
    totalListings,
    totalBookings,
    avgSyncDuration,
    logs,
  };
};

export function useGuestyMonitor() {
  return useQuery({
    queryKey: ["guesty-monitor"],
    queryFn: getGuestyMonitorData,
    refetchInterval: 12000, // real-time poll every 12s
  });
}
