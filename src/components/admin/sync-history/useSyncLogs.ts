
import { RetrySyncOptions, SyncLog, SyncLogsFilters, UseSyncLogsParams } from "./syncLog.types";
import { useSyncLogRetry } from "./useSyncLogRetry";
import { getAvailableIntegrations } from "./syncLog.state";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ----- Types from original fetcher -----
type RawSyncLog = Record<string, any>;
interface PageResult {
  data: SyncLog[];
  nextPage: number | null;
  availableIntegrations: string[];
}

// --- Transform function moved from useSyncLogFetcher.ts ---
function transformRawToSyncLog(raw: RawSyncLog): SyncLog {
  const service = raw.service || "";
  const syncType = raw.sync_type || null;
  const status = raw.status || "";
  const message = raw.message || raw.error_message || "";
  const syncedAt = raw.end_time || raw.start_time || raw.created_at || "";
  
  const totalListings = (
    (raw.listings_created || 0) + 
    (raw.listings_updated || 0) + 
    (raw.listings_deleted || 0)
  ) || undefined;
  
  const totalBookings = (
    (raw.bookings_created || 0) + 
    (raw.bookings_updated || 0) + 
    (raw.bookings_deleted || 0)
  ) || undefined;
  
  return {
    id: raw.id,
    service,
    sync_type: syncType,
    status,
    message,
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
    integration: service,
    synced_at: syncedAt,
    duration_ms: raw.sync_duration,
    total_listings: totalListings,
    total_bookings: totalBookings,
  };
}

// --- Fetch function, moved in as local function ---
async function fetchSyncLogs(
  pageParam: number,
  pageSize: number,
  filters: SyncLogsFilters
): Promise<PageResult> {
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

    const hasNextPage = logs && logs.length === pageSize;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    const transformedLogs = (logs || []).map(transformRawToSyncLog);

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

interface SyncLogHookResult {
  logs: SyncLog[];
  availableIntegrations: string[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: string | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => Promise<any>;
}

// ---- Main composed hook ----
export function useSyncLogs(params: UseSyncLogsParams) {
  const { pageSize, ...filters } = params;
  const retryHandler = useSyncLogRetry();

  // Use useInfiniteQuery without deep types
  const queryResult = useInfiniteQuery({
    queryKey: ['syncLogs', filters],
    queryFn: ({ pageParam }) => fetchSyncLogs(Number(pageParam), pageSize, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });

  const logs = queryResult.data?.pages.flatMap(page => page.data) || [];
  const availableIntegrations = queryResult.data?.pages[0]?.availableIntegrations || [];

  // Ensure retrySync returns the Promise from retryHandler.retrySync
  const retrySync = async (opts: RetrySyncOptions): Promise<unknown> => {
    return retryHandler.retrySync(opts, () => queryResult.refetch());
  };

  return {
    logs,
    isLoading: queryResult.isLoading,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    hasNextPage: !!queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    error: queryResult.error ? String(queryResult.error) : null,
    availableIntegrations,
    retrySync,
    isRetrying: retryHandler.isRetrying,
  };
}

// Re-export for easy imports
export type { SyncLog };

