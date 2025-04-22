import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SyncLog, UseSyncLogsParams, RetrySyncOptions } from "./syncLog.types";
import { appendLogs, getAvailableIntegrations, setRetryingFlag } from "./syncLog.state";

export function useSyncLogs({ pageSize, status, integration, listingId }: UseSyncLogsParams) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [page, setPage] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    setLogs([]);
    setPage(0);
    setHasNextPage(true);
    setIsLoading(true);
    setError(null);
  }, [status, integration, listingId]);

  const fetchLogs = useCallback(
    async (_page: number) => {
      try {
        const query = supabase
          .from("sync_logs")
          .select("*")
          .order("end_time", { ascending: false }) 
          .order("start_time", { ascending: false }) 
          .range(_page * pageSize, (_page + 1) * pageSize - 1);

        if (status) query.eq("status", status);
        if (integration) query.eq("service", integration);
        if (listingId) query.eq("listing_id", listingId);

        const { data: fetchedData, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        if (_page === 0) {
          const { data: all } = await supabase
            .from("sync_logs")
            .select("service")
            .neq("service", "")
            .limit(1000);
          if (all) setAvailableIntegrations(getAvailableIntegrations(all));
        }

        if (_page === 0) {
          setLogs(fetchedData || []);
        } else {
          setLogs((prev) => appendLogs(prev, fetchedData));
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

  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  const fetchNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    const nextPage = page + 1;
    setIsFetchingNextPage(true);
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  const retrySync = async ({ logId, service, syncType }: RetrySyncOptions) => {
    try {
      setIsRetrying((prev) => setRetryingFlag(prev, logId, true));
      const functionName = service?.toLowerCase() === 'guesty' ? 'guesty-sync' : 'sync-service';
      const { error: fnError } = await supabase.functions.invoke(functionName, {
        body: { sync_type: syncType, retry_from_log_id: logId }
      });
      if (fnError) throw new Error(fnError.message);
      toast({
        title: "Sync Retry Initiated",
        description: `${service} sync has been triggered. Check logs for updates.`,
      });
      await fetchLogs(0);
    } catch (e: any) {
      toast({
        title: "Sync Retry Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying((prev) => setRetryingFlag(prev, logId, false));
    }
  };

  return {
    logs,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    availableIntegrations,
    retrySync,
    isRetrying,
  };
}
