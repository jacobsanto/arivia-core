
export interface BookingActivityEntry {
  id: string;
  created_at?: string;
  start_time?: string;
  booking_id: string;
  guest_name?: string;
  event_type: "created" | "updated" | "cancelled";
  origin: "webhook" | "api";
  message?: string;
  synced_at: string;
}
