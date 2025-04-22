
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SyncLogsFilters } from "./syncLog.types";
import { getAvailableIntegrations } from "./syncLog.state";

// Define explicit return type for fetchSyncLogs to avoid excessive type instantiation
interface FetchSyncLogsResult {
  data: SyncLog[];
  nextPage: number | null;
  availableIntegrations: string[];
}

// Raw structure from the Supabase "sync_logs" table
type RawSupabaseLog = {
  id: string;
  service: string;
  sync_type?: string | null;
  status?: string | null;
  message?: string | null;
  error_message?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string | null;
  listing_id?: string | null;
  sync_duration?: number | null;
  bookings_created?: number | null;
  bookings_updated?: number | null;
  bookings_deleted?: number | null;
  listings_created?: number | null;
  listings_updated?: number | null;
  listings_deleted?: number | null;
  items_count?: number | null;
};

// Simplified sync log used throughout the UI/app
export type SyncLog = {
  id: string;
  integration: string;
  status: string;
  message: string;
  synced_at: string;
  duration_ms?: number;
  total_listings?: number;
  total_bookings?: number;
};

// Transforms a raw Supabase row into a simplified SyncLog object
function transformRawToSyncLog(raw: RawSupabaseLog): SyncLog {
  return {
    id: raw.id,
    integration: raw.service,
    status: raw.status ?? "",
    message: raw.message ?? raw.error_message ?? "",
    synced_at: raw.end_time ?? raw.start_time ?? raw.created_at ?? "",
    duration_ms: raw.sync_duration ?? undefined,
    total_listings:
      (raw.listings_created ?? 0) + (raw.listings_updated ?? 0) + (raw.listings_deleted ?? 0) || undefined,
    total_bookings:
      (raw.bookings_created ?? 0) + (raw.bookings_updated ?? 0) + (raw.bookings_deleted ?? 0) || undefined,
  };
}

// Fetch function for use with React Query that returns only simplified logs
async function fetchSyncLogs(
  pageParam: number,
  pageSize: number,
  filters: SyncLogsFilters
): Promise<FetchSyncLogsResult> {
  try {
    const { status, integration, listingId } = filters;
    const startIndex = pageParam * pageSize;
    const endIndex = startIndex + pageSize - 1;

    let query = supabase
      .from("sync_logs")
      .select("*")
      .order("end_time", { ascending: false })
      .order("start_time", { ascending: false })
      .range(startIndex, endIndex);

    if (status) query = query.eq("status", status);
    if (integration) query = query.eq("service", integration);
    if (listingId) query = query.eq("listing_id", listingId);

    const { data: logs, error } = await query;
    if (error) throw error;

    let availableIntegrations: string[] = [];

    // Only fetch integrations on first page
    if (pageParam === 0) {
      const { data: allServices } = await supabase
        .from("sync_logs")
        .select("service")
        .neq("service", "")
        .limit(1000);

      if (allServices) {
        availableIntegrations = getAvailableIntegrations(allServices);
      }
    }

    // Determine if there's a next page
    const hasNextPage = logs && logs.length === pageSize;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    // Map raw result to simplified SyncLog type
    const transformedLogs: SyncLog[] = (logs ?? []).map(transformRawToSyncLog);

    return {
      data: transformedLogs,
      nextPage,
      availableIntegrations,
    };
  } catch (error) {
    console.error("Error fetching sync logs:", error);
    throw error;
  }
}

export function useSyncLogFetcher(params: { pageSize: number } & SyncLogsFilters) {
  const { pageSize, ...filters } = params;

  const result = useInfiniteQuery({
    queryKey: ['syncLogs', filters],
    queryFn: ({ pageParam = 0 }) => fetchSyncLogs(pageParam, pageSize, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten pages of logs into a single array of simplified SyncLog
  const logs = result.data?.pages.flatMap(page => page.data) || [];
  // Get available integrations from the first page
  const availableIntegrations = result.data?.pages[0]?.availableIntegrations || [];

  return {
    logs,
    availableIntegrations,
    isLoading: result.isLoading,
    isFetchingNextPage: result.isFetchingNextPage,
    error: result.error ? String(result.error) : null,
    hasNextPage: !!result.hasNextPage,
    fetchNextPage: result.fetchNextPage,
    refetch: result.refetch
  };
}
