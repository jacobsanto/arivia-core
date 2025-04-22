
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SyncLog, SyncLogsFilters } from "./syncLog.types";
import { getAvailableIntegrations } from "./syncLog.state";

// Define explicit types for query responses to avoid excessive type inference
interface SyncLogQueryPage {
  data: SyncLog[];
  nextPage: number | null;
  availableIntegrations: string[];
}

// Define raw log type to help with transformation
interface RawSyncLog {
  id: string;
  service?: string | null;
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
}

// Transform function to convert raw DB records to the UI SyncLog format
function transformRawToSyncLog(raw: RawSyncLog): SyncLog {
  // Handle null values safely
  const service = raw.service || "";
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
    // Original properties
    id: raw.id,
    service,
    sync_type: raw.sync_type,
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

// Fetch function with explicit return type
async function fetchSyncLogs(
  pageParam: number,
  pageSize: number,
  filters: SyncLogsFilters
): Promise<SyncLogQueryPage> {
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
    const transformedLogs: SyncLog[] = (logs || []).map(raw => 
      transformRawToSyncLog(raw as RawSyncLog)
    );

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

// Type for hook return value to avoid excessive type inference
interface SyncLogFetcherResult {
  logs: SyncLog[];
  availableIntegrations: string[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: string | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

// Main hook with explicitly typed return value
export function useSyncLogFetcher(params: { pageSize: number } & SyncLogsFilters): SyncLogFetcherResult {
  const { pageSize, ...filters } = params;

  const result = useInfiniteQuery<SyncLogQueryPage, Error>({
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
