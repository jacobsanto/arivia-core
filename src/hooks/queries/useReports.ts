import { useAppQuery } from "@/hooks/query/useAppQuery";
import { supabase } from "@/integrations/supabase/client";

export type ReportSummary = {
  id: string;
  name: string;
  type?: string;
  lastRunAt?: string | null;
};

export type ReportDetail = {
  id: string;
  name: string;
  description?: string | null;
  config?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};

// Centralized Reports queries (typing-tolerant until tables exist)
export function useReportsSummary() {
  return useAppQuery<ReportSummary[]>(
    ["reports", "summary"],
    async () => {
      // Use untyped client access to avoid compile-time coupling to table name
      const { data, error } = await (supabase as any)
        .from("reports")
        .select("id, name, type, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped: ReportSummary[] = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name ?? "Untitled",
        type: r.type ?? undefined,
        lastRunAt: r.updated_at ?? null,
      }));

      return mapped;
    },
    { staleTime: 60_000 }
  );
}

export function useReportDetail(reportId?: string) {
  return useAppQuery<ReportDetail | null>(
    ["reports", reportId],
    async () => {
      if (!reportId) return null;
      const { data, error } = await (supabase as any)
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .maybeSingle();

      if (error) throw error;
      return (data as ReportDetail) ?? null;
    },
    { enabled: !!reportId }
  );
}
