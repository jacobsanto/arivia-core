
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Type for a sync log row (matches Supabase)
interface SyncLog {
  id: string;
  service: string;
  sync_type?: string | null;
  status?: string | null;
  message?: string | null;
  error_message?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string | null;
}

interface UseSyncLogsParams {
  pageSize: number;
  status: string | null;
  integration: string | null;
}

export function useSyncLogs({ pageSize, status, integration }: UseSyncLogsParams) {
  const [logs, setLogs] = useState<SyncLog[][]>([]); // paginated
  const [page, setPage] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);

  // For filter change, reset everything
  useEffect(() => {
    setLogs([]);
    setPage(0);
    setHasNextPage(true);
    setIsLoading(true);
    setError(null);
  }, [status, integration]);

  const fetchLogs = useCallback(
    async (_page: number) => {
      try {
        const query = supabase
          .from("sync_logs")
          .select("*")
          .order("end_time", { ascending: false, nullsLast: true })
          .order("start_time", { ascending: false, nullsLast: true })
          .range(_page * pageSize, (_page + 1) * pageSize - 1); // 0-based pagination

        if (status) query.eq("status", status);
        if (integration) query.eq("service", integration);

        const { data, error } = await query;
        if (error) throw error;

        // Build available integration names list for filtering chip
        if (_page === 0) {
          const { data: all } = await supabase
            .from("sync_logs")
            .select("service")
            .neq("service", "")
            .limit(1000);
          const integrations = Array.from(
            new Set((all || []).map((row: any) => (row.service || "").trim()).filter(Boolean))
          );
          setAvailableIntegrations(integrations);
        }

        setLogs((prev) =>
          _page === 0 ? [data || []] : [...prev, data || []]
        );
        setHasNextPage((data?.length || 0) === pageSize);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Failed to fetch sync logs");
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [pageSize, status, integration]
  );

  // On mount and relevant filter/page change
  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  // Fetch next page
  const fetchNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    const nextPage = page + 1;
    setIsFetchingNextPage(true);
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  return {
    logs,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    availableIntegrations,
  };
}
