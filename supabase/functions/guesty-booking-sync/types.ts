
export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export interface ListingProcessResult {
  listingId: string;
  success: boolean;
  bookingsCount?: number;
  error?: string;
}

export interface ProcessingResult {
  results: ListingProcessResult[];
  totalBookingsSynced: number;
  created: number;
  updated: number;
  deleted: number;
}

export interface BookingData {
  id: string;
  listing_id: string;
  guest_name: string;
  guest_email?: string | null;
  check_in: string;
  check_out: string;
  status: string;
  amount_paid?: number | null;
  currency?: string;
  total_guests?: number;
  last_synced: string;
  raw_data?: any;
  booking_created?: string | null;
  booking_updated?: string | null;
}
