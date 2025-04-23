
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimelineGroup } from "./timeline/TimelineGroup";
import { parseEventTypeAndGuest, groupByDay } from "./timeline/timelineUtils";
import { BookingActivityEntry } from "./types/bookingActivityTypes";

interface BookingActivityTimelineProps {
  listingId: string;
}

export default function BookingActivityTimeline({ listingId }: BookingActivityTimelineProps) {
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-activity-timeline", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("id, created_at, start_time, message, sync_type, service, booking_id, guest_name")
        .eq("service", "guesty")
        .or('sync_type.eq.bookings,sync_type.eq.webhook')
        .contains("message", `"listing_id":"${listingId}"`)
        .order("start_time", { ascending: false });

      if (error) throw error;

      return (data || []).map((log: any): BookingActivityEntry => {
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
        };
      });
    },
    enabled: !!listingId,
  });

  const handleToggleExpand = (id: string) => {
    setExpanded(exp => ({ ...exp, [id]: !exp[id] }));
  };

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

  const activity = data || [];
  if (activity.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No booking activity found for this property.
      </div>
    );
  }

  const eventsByDay = groupByDay(activity);

  return (
    <div className="py-4 space-y-6">
      <h3 className="text-md font-semibold mb-2">Booking Activity Timeline</h3>
      <div>
        {eventsByDay.map(([date, entries]) => (
          <TimelineGroup
            key={date}
            date={date}
            entries={entries}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
    </div>
  );
}
