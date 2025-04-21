
// Guesty Listing Type
export interface GuestyListing {
  _id: string;
  title: string;
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
  };
}

// Guesty Booking Type
export interface GuestyBooking {
  _id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  listing: {
    _id: string;
  };
  guest: {
    fullName: string;
    phone?: string;
    email?: string;
  };
}

// Guesty API Response Types
export interface GuestyListingsResponse {
  results: GuestyListing[];
}

export interface GuestyBookingsResponse {
  results: GuestyBooking[];
}
