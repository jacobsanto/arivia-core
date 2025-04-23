
import type { BookingActivityEntry } from "../useGuestyBookings";
import { format } from "date-fns";

export function parseEventTypeAndGuest(message: string): {
  event_type: "created" | "updated" | "cancelled";
  guest_name?: string;
} {
  const lowered = message.toLowerCase();
  if (lowered.includes("cancel")) return { event_type: "cancelled" };
  if (lowered.includes("create")) return { event_type: "created" };
  return { event_type: "updated" };
}

export function groupByDay(events: BookingActivityEntry[]): [string, BookingActivityEntry[]][] {
  const days: Record<string, BookingActivityEntry[]> = {};
  
  for (const entry of events) {
    const day = format(new Date(entry.synced_at), "yyyy-MM-dd");
    if (!days[day]) days[day] = [];
    days[day].push(entry);
  }
  
  // sort descending by day
  return Object.entries(days)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, value]) => [
      key, 
      value.sort((a, b) => b.synced_at.localeCompare(a.synced_at))
    ]);
}
