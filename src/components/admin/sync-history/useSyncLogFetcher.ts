
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SyncLog, SyncLogsFilters } from "./syncLog.types";
import { getAvailableIntegrations } from "./syncLog.state";

// Define explicit return type for fetchSyncLogs to avoid excessive type instantiation
interface FetchSyncLogsResult {
  data: SyncLog[];
  nextPage: number | null;
  availableIntegrations: string[];
}

// Transform function to convert raw DB records to the UI SyncLog format
function transformRawToSyncLog(raw: any): SyncLog {
  return {
    // Original properties
    id: raw.id,
    service: raw.service,
    sync_type: raw.sync_type,
    status: raw.status || "",
    message: raw.message || raw.error_message || "",
    error_message: raw.error_message,
    start_time: raw.start_time,
    end_time: raw.end_time,
    created_at: raw.created_at,
    listing_id: raw.listing_id,
    sync_duration: raw.sync_duration,
    bookings_created: raw.bookings_created,
    bookings_updated: raw.bookings_updated,
    bookings_deleted: raw.bookings_deleted,
    listings_created: raw.listings_created,
    listings_updated: raw.listings_updated,
    listings_deleted: raw.listings_deleted,
    items_count: raw.items_count,
    
    // UI friendly aliases
    integration: raw.service,
    synced_at: raw.end_time || raw.start_time || raw.created_at || "",
    duration_ms: raw.sync_duration,
    total_listings:
      (raw.listings_created || 0) + (raw.listings_updated || 0) + (raw.listings_deleted || 0) || undefined,
    total_bookings:
      (raw.bookings_created || 0) + (raw.bookings_updated || 0) + (raw.bookings_deleted || 0) || undefined,
  };
}

// Fetch function for use with React Query
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

    // Map raw result to SyncLog type
    const transformedLogs: SyncLog[] = (logs || []).map(transformRawToSyncLog);

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

  // Flatten pages of logs into a single array
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
