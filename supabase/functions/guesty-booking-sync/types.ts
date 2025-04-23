
export interface BookingSyncResult {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  endpoint: string;
}

export interface BookingData {
  id: string;
  listing_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  last_synced: string;
  raw_data: any;
}
