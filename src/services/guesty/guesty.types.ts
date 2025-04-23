
export interface GuestyListingDB {
  id: string;
  title: string;
  status?: string;
  address?: {
    full?: string;
    city?: string;
    country?: string;
  } | null;
  property_type?: string;
  raw_data?: Record<string, any>;
  thumbnail_url?: string;
  highres_url?: string;
  sync_status?: string;
  is_deleted?: boolean;
  last_synced?: string;
  created_at?: string;
  updated_at?: string;
  first_synced_at?: string;
}

export interface GuestyBookingDB {
  id: string;
  listing_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  raw_data?: Record<string, any>;
  webhook_updated?: boolean;
  last_synced?: string;
}

export interface GuestySyncResponse {
  success: boolean;
  message?: string;
  listingsCount?: number;
  bookingsSynced?: number;
  error?: string;
  moreListingsToProcess?: boolean;
  processedCount?: number;
}
