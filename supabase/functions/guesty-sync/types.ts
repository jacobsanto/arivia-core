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

// Guesty Booking Type
export interface GuestyBooking {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  listing: {
    _id: string;
    title?: string;
  };
  guest: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  [key: string]: any; // Allow for other properties
}

// Guesty API Response Types
export interface GuestyListingsResponse {
  results: GuestyListing[];
}

export interface GuestyBookingsResponse {
  results: GuestyBooking[];
}
