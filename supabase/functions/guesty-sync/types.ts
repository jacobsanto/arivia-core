
// Guesty Listing Type
export interface GuestyListing {
  _id: string;
  title?: string;
  address?: {
    full?: string;
    city?: string;
    country?: string;
  };
  status?: string;
  propertyType?: string;
  cleaningStatus?: {
    value: string;
  };
  picture?: {
    thumbnail?: string;
    large?: string;
    original?: string;
  };
  [key: string]: any; // Allow for other properties
}

// Guesty Reservation Type - updated for /v1/reservations
export interface GuestyBooking {
  id: string;                  // reservation ID
  listingId: string;           // property/listing ID
  guest?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  startDate?: string;          // check-in
  endDate?: string;            // check-out
  status?: string;
  notes?: string;              // may be present
  [key: string]: any;
}

// Guesty API Response Types
export interface GuestyListingsResponse {
  results: GuestyListing[];
}

export interface GuestyBookingsResponse {
  results: GuestyBooking[];
}
