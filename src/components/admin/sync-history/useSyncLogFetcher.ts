
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SyncLog, UseSyncLogsParams } from "./syncLog.types";
import { appendLogs, getAvailableIntegrations } from "./syncLog.state";

// Centralized fetching logic for paged logs. Returns logs, page, loading, error, etc.
export function useSyncLogFetcher({
  pageSize,
  status,
  integration,
  listingId,
}: UseSyncLogsParams) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [page, setPage] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);

  const fetchLogs = useCallback(
    async (targetPage: number) => {
      try {
        const query = supabase
          .from("sync_logs")
          .select("*")
          .order("end_time", { ascending: false })
          .order("start_time", { ascending: false })
          .range(targetPage * pageSize, (targetPage + 1) * pageSize - 1);

        if (status) query.eq("status", status);
        if (integration) query.eq("service", integration);
        if (listingId) query.eq("listing_id", listingId);

        const { data: fetchedData, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        if (targetPage === 0) {
          const { data: all } = await supabase
            .from("sync_logs")
            .select("service")
            .neq("service", "")
            .limit(1000);
          if (all) setAvailableIntegrations(getAvailableIntegrations(all));
        }

        if (targetPage === 0) {
          setLogs(fetchedData || []);
        } else {
          setLogs(prev => appendLogs(prev, fetchedData));
        }

        setHasNextPage((fetchedData?.length || 0) === pageSize);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Failed to fetch sync logs");
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [pageSize, status, integration, listingId]
  );

  // Fetch first page on filters change
  const refetch = useCallback(() => {
    setLogs([]); setPage(0); setHasNextPage(true); setIsLoading(true); setError(null);
    return fetchLogs(0);
  }, [fetchLogs]);

  // For next-page loading
  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const nextPage = page + 1;
    setIsFetchingNextPage(true);
    setPage(nextPage);
    fetchLogs(nextPage);
  }, [hasNextPage, isFetchingNextPage, page, fetchLogs]);

  return {
    logs, setLogs,
    page, setPage,
    isFetchingNextPage, setIsFetchingNextPage,
    isLoading, setIsLoading,
    hasNextPage, setHasNextPage,
    error, setError,
    availableIntegrations, setAvailableIntegrations,
    fetchLogs,
    fetchNextPage,
    refetch
  };
}
