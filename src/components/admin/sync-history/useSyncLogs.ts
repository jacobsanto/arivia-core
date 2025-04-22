
import { useEffect } from "react";
import { UseSyncLogsParams, SyncLog, RetrySyncOptions } from "./syncLog.types";
import { useSyncLogFilters } from "./useSyncLogFilters";
import { useSyncLogRetry } from "./useSyncLogRetry";
import { useSyncLogFetcher } from "./useSyncLogFetcher";

// Composes fetcher, filters, and retry logic for sync logs usage
export function useSyncLogs(params: UseSyncLogsParams) {
  const fetcher = useSyncLogFetcher(params);
  const retryHandler = useSyncLogRetry();

  // Refetch when params change
  useEffect(() => {
    fetcher.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.status, params.integration, params.listingId, params.pageSize]);

  // Compose retrySync that refetches after retry
  const retrySync = (opts: RetrySyncOptions) => retryHandler.retrySync(opts, fetcher.refetch);

  return {
    logs: fetcher.logs,
    isLoading: fetcher.isLoading,
    isFetchingNextPage: fetcher.isFetchingNextPage,
    hasNextPage: fetcher.hasNextPage,
    fetchNextPage: fetcher.fetchNextPage,
    error: fetcher.error,
    availableIntegrations: fetcher.availableIntegrations,
    retrySync,
    isRetrying: retryHandler.isRetrying,
  };
}

export type { SyncLog };
