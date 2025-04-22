
import { RetrySyncOptions, SyncLog, SyncLogsFilters, UseSyncLogsParams } from "./syncLog.types";
import { useSyncLogRetry } from "./useSyncLogRetry";
import { useSyncLogFetcher } from "./useSyncLogFetcher";

// Main composed hook for sync logs (fetch + retry)
export function useSyncLogs(params: UseSyncLogsParams) {
  const fetcher = useSyncLogFetcher(params);
  const retryHandler = useSyncLogRetry();

  // Ensure retrySync returns the Promise from retryHandler.retrySync
  const retrySync = async (opts: RetrySyncOptions): Promise<unknown> => {
    return retryHandler.retrySync(opts, () => fetcher.refetch());
  };

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

// Re-export for easy imports
export type { SyncLog };
