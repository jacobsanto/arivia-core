
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar } from "lucide-react";
import { Zap, Package, Check, X } from "lucide-react";
import { format, isWithinInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";

type SyncLogEntry = {
  id: string;
  status: string;
  sync_type: string | null;
  service: string | null;
  start_time: string;
  end_time: string | null;
  message: string | null;
  items_count: number | null;
};

const STATUS_DETAILS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: "Success", color: "bg-green-600 text-white", icon: <Check className="w-4 h-4" /> },
  error: { label: "Error", color: "bg-red-600 text-white", icon: <X className="w-4 h-4" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-400 text-white", icon: <Package className="w-4 h-4" /> }
};

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  webhook: { label: "Webhook", icon: <Zap className="text-pink-600 w-4 h-4" /> },
  bookings: { label: "API Sync", icon: <Package className="text-blue-600 w-4 h-4" /> }
};

const DATE_FILTERS = [
  { label: "Last 7d", value: 7 },
  { label: "Last 30d", value: 30 },
  { label: "All Time", value: null }
];

// Util to filter and paginate entries
function filterAndPaginate(logs: SyncLogEntry[], type: string, daysBack: number | null, page: number, pageSize: number): { entries: SyncLogEntry[], maxPages: number } {
  let filtered = logs.filter(log => type === "all" ? (["webhook", "bookings"].includes(log.sync_type ?? "")) : log.sync_type === type);
  if (daysBack !== null) {
    filtered = filtered.filter(log =>
      isWithinInterval(new Date(log.start_time), {
        start: subDays(new Date(), daysBack),
        end: new Date()
      })
    );
  }
  filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  const maxPages = Math.ceil(filtered.length / pageSize);
  const entries = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { entries, maxPages };
}

const PAGE_SIZE = 20;

const BookingSyncDashboard: React.FC = () => {
  // Filters
  const [activeType, setActiveType] = useState<"all" | "webhook" | "bookings">("all");
  const [daysBack, setDaysBack] = useState<number | null>(7);
  const [page, setPage] = useState(1);

  // Fetch up to 100 (should be enough for pagination/filtering)
  const { data: logs, isLoading } = useQuery({
    queryKey: ["guesty-booking-sync-logs", activeType, daysBack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("id,sync_type,service,status,start_time,end_time,message,items_count")
        .in("sync_type", ["webhook", "bookings"])
        .order("start_time", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SyncLogEntry[];
    },
    refetchInterval: 10000,
  });

  const { entries: pagedLogs, maxPages } = useMemo(
    () => logs ? filterAndPaginate(logs, activeType, daysBack, page, PAGE_SIZE) : { entries: [], maxPages: 1 },
    [logs, activeType, daysBack, page]
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // When filters change, reset to page 1
  React.useEffect(() => { setPage(1); }, [activeType, daysBack]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Guesty Sync History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-muted-foreground text-sm min-w-[70px]">Type:</span>
          {["all", "bookings", "webhook"].map(type => (
            <Button
              key={type}
              variant={activeType === type ? "default" : "outline"}
              size="sm"
              className={cn("px-3", activeType === type ? "" : "bg-muted")}
              onClick={() => setActiveType(type as "all" | "bookings" | "webhook")}
            >
              {type === "all" ? "All" : TYPE_LABELS[type].label}
            </Button>
          ))}
          <span className="ml-3 text-muted-foreground text-sm min-w-[70px]">Date:</span>
          {DATE_FILTERS.map(f => (
            <Button
              key={f.label}
              variant={daysBack === f.value ? "default" : "outline"}
              size="sm"
              className={cn("px-3", daysBack === f.value ? "" : "bg-muted")}
              onClick={() => setDaysBack(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div>
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading…</div>
          ) : pagedLogs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No sync activity found</div>
          ) : (
            <ul className={cn(
              "space-y-2",
              isMobile && "space-y-3"
            )}>
              {pagedLogs.map((log) => (
                <li
                  key={log.id}
                  className={cn(
                    "rounded-lg border bg-card p-3 transition-shadow shadow-sm group",
                    isMobile ? "flex flex-col gap-2 w-full touch-feedback" : "flex items-center gap-4"
                  )}
                  tabIndex={0}
                >
                  {/* Type Icon & Label */}
                  <div className={cn(
                    "flex items-center gap-1 min-w-[78px]",
                    isMobile ? "flex-row" : "flex-col items-center"
                  )}>
                    {log.sync_type && TYPE_LABELS[log.sync_type]?.icon}
                    <span className="font-medium text-xs text-muted-foreground">
                      {log.sync_type && TYPE_LABELS[log.sync_type]?.label}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className={cn("flex-1 min-w-0", isMobile ? "" : "grid grid-cols-4 gap-2 items-center")}>
                    {/* Booking & Listing ID */}
                    <div className="text-xs text-muted-foreground break-words max-w-[140px] md:max-w-[120px]">
                      <span className="font-medium">Booking:</span> {log.items_count ? log.items_count : "-"}<br/>
                      <span className="font-medium">Listing:</span> {(log.message?.match(/listing (\w+)/)?.[1]) ?? "-"}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-xs h-5 px-2 min-w-[64px] flex items-center gap-1",
                          STATUS_DETAILS[log.status]?.color ?? "bg-gray-200 text-black"
                        )}
                      >
                        {STATUS_DETAILS[log.status]?.icon ?? null}
                        {STATUS_DETAILS[log.status]?.label ?? log.status}
                      </Badge>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(log.start_time), "MMM d, HH:mm")}
                    </div>

                    {/* Collapsible Message (desktop: always visible, mobile: tap to expand) */}
                    <CollapsibleMessage message={log.message ?? "-"} isMobile={isMobile} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Pagination */}
        {maxPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => { e.preventDefault(); setPage(page > 1 ? page - 1 : 1); }}
                  className={page === 1 ? "opacity-30 pointer-events-none" : ""}
                />
              </PaginationItem>
              <span className="mx-2 text-xs text-muted-foreground">
                Page {page} of {maxPages}
              </span>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); setPage(page < maxPages ? page + 1 : page); }}
                  className={page === maxPages ? "opacity-30 pointer-events-none" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

// Collapsible message: on mobile, tap to expand; on desktop, always show
const CollapsibleMessage: React.FC<{ message: string; isMobile: boolean }> = ({ message, isMobile }) => {
  const [open, setOpen] = React.useState(false);
  if (!isMobile) return (
    <div className="text-xs text-muted-foreground line-clamp-2 break-words max-w-xs">{message}</div>
  );
  return (
    <button className={cn(
        "text-left w-full text-xs text-muted-foreground transition-all px-1 py-0.5 rounded-md",
        open ? "bg-muted/80" : "bg-transparent",
      )}
      style={{ minHeight: "36px" }}
      onClick={() => setOpen(v => !v)}
      aria-expanded={open}
    >
      <span className={cn("block", !open && "truncate")}>
        {open ? message : message?.split("\n")[0] ?? "-"}
      </span>
      {!open && message?.length > 64 && (<span className="text-blue-500 ml-1">…more</span>)}
    </button>
  );
};

export default BookingSyncDashboard;
