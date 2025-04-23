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
  guest_name: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  status: string;
  amount_paid: number | null;
  currency: string | null;
  total_guests: number;
  booking_created: string | null;
  booking_updated: string | null;
  raw_data?: any;
  last_synced: string;
}

export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export interface SyncResponse {
  success: boolean;
  bookings_synced: number;
  listings_attempted: number;
  listings_synced: number;
  failed_listings: string[];
  time_taken: string;
  warning?: string;
  message?: string;
  error?: string;
}

export interface ListingProcessResult {
  listingId: string;
  success: boolean;
  bookingsCount?: number;
  error?: string;
}
