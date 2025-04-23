
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Zap } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BookingActivityEntry {
  id: string;
  created_at: string;
  start_time: string;
  booking_id?: string;
  guest_name?: string;
  event_type: "created" | "updated" | "cancelled";
  origin: "webhook" | "api";
  message: string;
  synced_at: string;
}

function parseEventTypeAndGuest(message: string): {
  event_type: "created" | "updated" | "cancelled";
  guest_name?: string;
} {
  const lowered = message.toLowerCase();
  if (lowered.includes("cancel")) return { event_type: "cancelled" };
  if (lowered.includes("create")) return { event_type: "created" };
  // Fallback - treat as updated
  return { event_type: "updated" };
}

// Friendly event icon
function EventTypeIcon({ event, className = "" }: { event: string; className?: string }) {
  switch (event) {
    case "created":
      return <Calendar className={cn("text-green-600", className)} size={18} />;
    case "updated":
      return <Package className={cn("text-blue-600", className)} size={18} />;
    case "cancelled":
      return <Calendar className={cn("text-red-600", className)} size={18} />;
    default:
      return null;
  }
}

// Friendly origin icon
function OriginIcon({ origin, className = "" }: { origin: string; className?: string }) {
  return origin === "webhook" 
    ? <Zap className={cn("text-yellow-500", className)} size={16} />
    : <Package className={cn("text-blue-500", className)} size={16} />;
}

function groupByDay(events: BookingActivityEntry[]) {
  const days: Record<string, BookingActivityEntry[]> = {};
  for (const entry of events) {
    const day = format(new Date(entry.synced_at), "yyyy-MM-dd");
    if (!days[day]) days[day] = [];
    days[day].push(entry);
  }
  // sort descending by day
  return Object.entries(days)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, value]) => [key, value.sort((a, b) => b.synced_at.localeCompare(a.synced_at))] as const);
}

export default function BookingActivityTimeline({ listingId }: { listingId: string }) {
  const [expanded, setExpanded] = React.useState<{ [id: string]: boolean }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-activity-timeline", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("id, created_at, start_time, message, sync_type, service, booking_id, guest_name")
        .eq("service", "guesty")
        .or('sync_type.eq.bookings,sync_type.eq.webhook')
        .contains("message", `"listing_id":"${listingId}"`) // message body includes our listing id
        .order("start_time", { ascending: false }); // most recent first

      if (error) throw error;
      // Filter for booking events for this listing
      return (data || []).map((log: any) => {
        // Try to extract Booking ID + Name from message, fallback to db columns
        let bookingId = log.booking_id;
        let guest_name = log.guest_name;
        const msgMatch = typeof log.message === "string" && log.message.match(/booking_id.?["']?:.?["']?([\w-]+)/i);
        if (!bookingId && msgMatch) bookingId = msgMatch[1];
        const guestMatch = typeof log.message === "string" && log.message.match(/guest.?["']?:.?["']?([\w\s]+)/i);
        if (!guest_name && guestMatch) guest_name = guestMatch[1];
        const { event_type } = parseEventTypeAndGuest(log.message || "");

        return {
          id: log.id,
          created_at: log.created_at,
          start_time: log.start_time,
          booking_id: bookingId || "Unknown",
          guest_name,
          event_type,
          origin: log.sync_type === "webhook" ? "webhook" : "api",
          message: log.message,
          synced_at: log.start_time || log.created_at,
        } as BookingActivityEntry;
      }) as BookingActivityEntry[];
    },
    enabled: !!listingId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        Loading timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-4">
        Could not load booking timeline: {error.message}
      </div>
    );
  }

  const activity = (data || []);
  if (activity.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No booking activity found for this property.
      </div>
    );
  }

  // Group events by day (descending)
  const eventsByDay = groupByDay(activity);

  return (
    <div className="py-4 space-y-6">
      <h3 className="text-md font-semibold mb-2">Booking Activity Timeline</h3>
      <div>
        {eventsByDay.map(([date, entries]) => (
          <div key={date} className="mb-6">
            <div className="text-xs font-medium text-muted-foreground mb-2 pl-2">
              {isToday(new Date(date)) ? "Today" : isYesterday(new Date(date)) ? "Yesterday" : format(new Date(date), "d MMM yyyy")}
            </div>
            <div className="space-y-2">
              {entries.map(entry => {
                const isExpanded = expanded[entry.id] || false;
                return (
                  <Card
                    key={entry.id}
                    className={cn(
                      "w-full transition-shadow duration-200 cursor-pointer border",
                      isExpanded && "shadow-lg bg-muted/50"
                    )}
                    onClick={() => setExpanded(exp => ({ ...exp, [entry.id]: !exp[entry.id] }))}
                  >
                    <CardContent className="py-3 px-4 flex flex-col">
                      <div className="flex items-center gap-2">
                        <EventTypeIcon event={entry.event_type} />
                        <Badge
                          variant={
                            entry.event_type === "created"
                              ? "default"
                              : entry.event_type === "updated"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {entry.event_type.charAt(0).toUpperCase() + entry.event_type.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(entry.synced_at), "HH:mm")}
                        </span>
                        <span className="flex items-center gap-1 ml-auto mr-2">
                          <OriginIcon origin={entry.origin} />
                          <span className="text-xs text-muted-foreground">{entry.origin === "webhook" ? "Webhook" : "API Sync"}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col md:flex-row md:items-center md:gap-3">
                        <span className="text-sm font-medium">
                          Booking ID: <span className="font-mono">{entry.booking_id}</span>
                        </span>
                        {entry.guest_name && (
                          <span className="text-xs text-muted-foreground ml-0 md:ml-1">
                            • Guest: {entry.guest_name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); setExpanded(exp => ({ ...exp, [entry.id]: !isExpanded })); }}
                          className="px-2 h-7 text-xs"
                        >
                          {isExpanded ? "Hide Details" : "Show Details"}
                        </Button>
                      </div>
                      {isExpanded && (
                        <div className="bg-muted rounded p-2 mt-2 text-xs font-mono break-words whitespace-pre-line select-text">
                          {entry.message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
