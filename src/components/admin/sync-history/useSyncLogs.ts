
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type for a sync log row (matches Supabase)
export interface SyncLog {
  id: string;
  service: string;
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

interface UseSyncLogsParams {
  pageSize: number;
  status: string | null;
  integration: string | null;
  listingId?: string | null;
}

interface RetrySyncOptions {
  logId: string;
  service: string;
  syncType?: string | null;
}

export function useSyncLogs({ pageSize, status, integration, listingId }: UseSyncLogsParams) {
  // Define explicit type for logs to avoid excessive type inference
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [page, setPage] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Reset everything when filter changes
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

        const { data, error } = await query;
        if (error) throw error;

        // Build available integration names list for filtering
        if (_page === 0) {
          const { data: all } = await supabase
            .from("sync_logs")
            .select("service")
            .neq("service", "")
            .limit(1000);
          
          if (all) {
            const integrations = Array.from(
              new Set(all.map((row: any) => (row.service || "").trim()).filter(Boolean))
            );
            setAvailableIntegrations(integrations);
          }
        }

        // Fixed: Update logs state in a way that avoids deep type instantiation
        // For first page, replace logs array entirely
        if (_page === 0) {
          setLogs(data || []);
        } else {
          // For additional pages, create a new array instead of spreading
          // This helps prevent TypeScript from creating excessively deep types
          setLogs((prevLogs) => {
            const newLogs = [...prevLogs];
            if (data) {
              data.forEach((item) => newLogs.push(item));
            }
            return newLogs;
          });
        }
        
        setHasNextPage((data?.length || 0) === pageSize);
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

  // Initial fetch and when filters change
  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  // Fetch next page of logs
  const fetchNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const nextPage = page + 1;
    setIsFetchingNextPage(true);
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  // Retry a failed sync
  const retrySync = async ({ logId, service, syncType }: RetrySyncOptions) => {
    try {
      // Create a new object to avoid mutating existing state
      const newRetrying = { ...isRetrying, [logId]: true };
      setIsRetrying(newRetrying);
      
      // Call the appropriate edge function based on the service
      const functionName = service?.toLowerCase() === 'guesty' ? 'guesty-sync' : 'sync-service';
      
      // Call the Supabase edge function
      const { error: fnError } = await supabase.functions.invoke(functionName, {
        body: { 
          sync_type: syncType,
          retry_from_log_id: logId
        }
      });
      
      if (fnError) throw new Error(fnError.message);
      
      // On successful function call
      toast({
        title: "Sync Retry Initiated",
        description: `${service} sync has been triggered. Check logs for updates.`,
      });
      
      // Refresh the logs
      await fetchLogs(0);
      
    } catch (e: any) {
      toast({
        title: "Sync Retry Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Create a new object again to avoid mutation
      setIsRetrying((prev) => ({ ...prev, [logId]: false }));
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
