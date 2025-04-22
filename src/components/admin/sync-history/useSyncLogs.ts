
import { RetrySyncOptions, SyncLog, UseSyncLogsParams } from "./syncLog.types";
import { useSyncLogRetry } from "./useSyncLogRetry";
import { useSyncLogFetcher } from "./useSyncLogFetcher";

// Composes fetcher and retry logic for sync logs usage
export function useSyncLogs(params: UseSyncLogsParams) {
  const fetcher = useSyncLogFetcher(params);
  const retryHandler = useSyncLogRetry();

  // Compose retrySync that refetches after retry
  const retrySync = (opts: RetrySyncOptions) => 
    retryHandler.retrySync(opts, fetcher.refetch);

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
