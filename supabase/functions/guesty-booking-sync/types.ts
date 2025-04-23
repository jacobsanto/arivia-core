
export interface GuestyBooking {
  id: string;
  listing_id: string;
  guest_name: string | null;
  guest_email: string | null;
  amount_paid: number;
  currency: string;
  status: string;
  total_guests: number;
  check_in: string;
  check_out: string;
  raw_data: any;
  last_synced: string;
}

export interface SyncResponse {
  success: boolean;
  bookings_synced?: number;
  listings_attempted?: number;
  listings_synced?: number;
  failed_listings?: string[];
  time_taken?: string;
  message?: string;
  error?: string;
}

export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export interface SyncLogData {
  provider: string;
  sync_type: string;
  status: string;
  start_time: string;
  message: string;
}
