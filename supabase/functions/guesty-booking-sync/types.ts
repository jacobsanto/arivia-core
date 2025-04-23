
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
