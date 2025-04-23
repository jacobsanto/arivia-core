
// Types for the booking sync function

export interface SyncLogData {
  provider: string;
  sync_type: string;
  status: string;
  start_time: string;
  message: string;
}

export interface GuestyBooking {
  id: string;
  listing_id: string;
  check_in: string;
  check_out: string;
  guest_name?: string;
  guest_email?: string;
  amount_paid?: number;
  currency?: string;
  status: string;
  total_guests?: number;
  raw_data?: any;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListingProcessResult {
  listingId: string;
  success: boolean;
  bookingsCount: number;
  error?: string;
}

export interface BatchProcessResult {
  results: ListingProcessResult[];
  totalBookingsSynced: number;
  created: number;
  updated: number;
  deleted: number;
}

export interface SyncResponse {
  success: boolean;
  bookings_synced: number;
  listings_attempted: number;
  listings_synced: number;
  failed_listings: string[];
  time_taken: string;
  message?: string;
  error?: string;
  moreListingsToProcess?: boolean;
  processedCount?: number;
}

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
