
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SyncLog, SyncLogsFilters } from "./syncLog.types";
import { getAvailableIntegrations } from "./syncLog.state";

// Simple type for raw database records
type RawSyncLog = Record<string, any>;

// Explicitly define the structure of a page result
interface PageResult {
  data: SyncLog[];
  nextPage: number | null;
  availableIntegrations: string[];
}

// Transform function to convert raw DB records to the UI SyncLog format
function transformRawToSyncLog(raw: RawSyncLog): SyncLog {
  // Handle null values safely with defaults
  const service = raw.service || "";
  const syncType = raw.sync_type || null;
  const status = raw.status || "";
  const message = raw.message || raw.error_message || "";
  const syncedAt = raw.end_time || raw.start_time || raw.created_at || "";
  
  // Calculate totals safely
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

// Simplified fetch function with explicit return type
async function fetchSyncLogs(
  pageParam: number,
  pageSize: number,
  filters: SyncLogsFilters
): Promise<PageResult> {
  try {
    const { status, integration, listingId } = filters;
    const startIndex = pageParam * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // Build the Supabase query
    let query = supabase
      .from("sync_logs")
      .select("*")
      .order("end_time", { ascending: false })
      .order("start_time", { ascending: false })
      .range(startIndex, endIndex);

    // Apply filters if provided
    if (status) query = query.eq("status", status);
    if (integration) query = query.eq("service", integration);
    if (listingId) query = query.eq("listing_id", listingId);

    const { data: logs, error } = await query;
    if (error) throw error;

    // Prepare available integrations list
    let availableIntegrations: string[] = [];

    // Only fetch integrations on first page for efficiency
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

    // Transform raw logs to SyncLog format
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

// Explicitly define the hook return type
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

// Simplified hook implementation that avoids complex type inference
export function useSyncLogFetcher(
  params: { pageSize: number } & SyncLogsFilters
): SyncLogHookResult {
  const { pageSize, ...filters } = params;

  // Use useInfiniteQuery with explicit typings to avoid deep type recursion
  const queryResult = useInfiniteQuery({
    queryKey: ['syncLogs', filters] as const,
    queryFn: ({ pageParam }) => fetchSyncLogs(Number(pageParam), pageSize, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extract and flatten the results
  const logs = queryResult.data?.pages.flatMap(page => page.data) || [];
  
  // Get available integrations from the first page
  const availableIntegrations = queryResult.data?.pages[0]?.availableIntegrations || [];

  // Return a simplified result object
  return {
    logs,
    availableIntegrations,
    isLoading: queryResult.isLoading,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    error: queryResult.error ? String(queryResult.error) : null,
    hasNextPage: !!queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    refetch: queryResult.refetch
  };
}
