
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SyncLog, SyncLogsFilters } from "./syncLog.types";
import { getAvailableIntegrations } from "./syncLog.state";

// Fetch function for use with React Query
async function fetchSyncLogs(
  pageParam: number,
  pageSize: number,
  filters: SyncLogsFilters
): Promise<{ data: SyncLog[]; nextPage: number | null; availableIntegrations: string[] }> {
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

    return {
      data: logs || [],
      nextPage,
      availableIntegrations
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

  // Flatten the pages of logs into a single array
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
