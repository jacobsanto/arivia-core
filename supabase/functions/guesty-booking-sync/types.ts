
export interface SyncResponse {
  success: boolean;
  listings_processed: number;
  total_bookings: number;
  time_taken: string;
  failed_listings: string[];
}

export interface GuestyBooking {
  id: string;
  listing_id: string;
  guest_name: string | null;
  guest_email: string | null;
  amount_paid: number;
  currency: string;
  status: string;
  total_guests: number;
  check_in: string; // mapped from startDate
  check_out: string; // mapped from endDate
  raw_data: any;
  last_synced: string;
}
