import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { maskSensitive, formatValue } from "@/lib/audit-utils";

type AuditRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  message: string;
  metadata: any;
  route?: string | null;
};

type Profile = {
  user_id: string;
  name: string | null;
  email: string | null;
};

interface SettingsHistoryDialogProps {
  category: string;
  trigger?: React.ReactNode;
  className?: string;
}

export const SettingsHistoryDialog: React.FC<SettingsHistoryDialogProps> = ({ category, trigger, className }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const pageSize = 20;

  const fetchPage = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const from = rows.length;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, created_at, user_id, message, metadata, route')
        .contains('metadata', { category })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const newRows = data as AuditRow[];

      if (!newRows || newRows.length === 0) {
        setHasMore(false);
        return;
      }

      setRows(prev => [...prev, ...newRows]);

      // Fetch profiles for any new user ids
      const ids = Array.from(new Set(newRows.map(r => r.user_id).filter(Boolean))) as string[];
      const missing = ids.filter(id => !profiles[id]);
      if (missing.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', missing);
        const map = Object.fromEntries((profs || []).map(p => [p.user_id, p]));
        setProfiles(prev => ({ ...prev, ...map }));
      }

      if (newRows.length < pageSize) setHasMore(false);
    } catch (e) {
      // silent fail to avoid UX break; optionally add toast in future
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [category, loading, pageSize, profiles, rows.length]);

  useEffect(() => {
    if (open && rows.length === 0) {
      // initial load
      fetchPage();
    }
  }, [open, rows.length, fetchPage]);

  // Reset when closing to avoid stale data between categories (if reused)
  useEffect(() => {
    if (!open) {
      setRows([]);
      setHasMore(true);
    }
  }, [open]);

  const getUserLabel = useCallback((user_id: string | null) => {
    if (!user_id) return 'System';
    const p = profiles[user_id];
    if (!p) return user_id.slice(0, 8);
    return p.name || p.email || user_id.slice(0, 8);
  }, [profiles]);

  const content = useMemo(() => (
    <div className="space-y-4">
      {rows.length === 0 && !loading && (
        <div className="text-sm text-muted-foreground">No history yet for this category.</div>
      )}

      <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
        {rows.map((row) => {
          const changes = (row.metadata?.changes ?? {}) as Record<string, { before: any; after: any }>;
          const fields = Object.keys(changes);
          return (
            <div key={row.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="font-medium">{getUserLabel(row.user_id)}</div>
                <div className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{row.message}</div>
              {fields.length > 0 && (
                <div className="mt-3 space-y-2">
                  {fields.map((key) => {
                    const diff = changes[key];
                    const before = maskSensitive(key, diff.before);
                    const after = maskSensitive(key, diff.after);
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div className="font-medium">{key}</div>
                        <div className="truncate break-all text-muted-foreground">{formatValue(before)}</div>
                        <div className="truncate break-all">{formatValue(after)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={fetchPage} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  ), [rows, loading, hasMore, fetchPage, getUserLabel]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className={cn(className)}>View history</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change history · {category}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsHistoryDialog;
