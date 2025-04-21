
// Main Guesty API types based on their documentation
// https://open-api-docs.guesty.com/

// Base response interface for paginated results
export interface GuestyPaginatedResponse<T> {
  results: T[];
  count: number;
  limit: number;
  skip: number;
}

// Listing (Property) related types
export interface GuestyListing {
  _id: string;
  title: string;
  nickname: string;
  picture: {
    thumbnail: string;
    regular: string;
    large: string;
    caption: string;
    _id: string;
  }[];
  address: {
    street: string;
    city: string;
    country: string;
    apt: string;
    zipcode: string;
    state: string;
    lat: number;
    lng: number;
    full: string;
  };
  publicDescription: string;
  propertyTypeId: string;
  propertyType: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  roomType: string;
  accommodates: number;
  amenities: string[];
  amenitiesNotIncluded: string[];
  active: boolean;
  currency: string;
}

// Guest related types
export interface GuestyGuest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    country: string;
    apt: string;
    zipcode: string;
    state: string;
  };
  pictureUrl: string;
}

// Reservation (Booking) related types
export interface GuestyReservation {
  _id: string;
  guestId: string;
  listingId: string;
  status: 'inquiry' | 'pending' | 'declined' | 'canceled' | 'confirmed' | 'checked-in' | 'checked-out';
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  nightsCount: number;
  guestsCount: number;
  money: {
    totalPrice: number;
    basePriceNight: number;
    securityDeposit: number;
    cleaningFee: number;
    currency: string;
  };
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  integration: {
    platform: string;
    externalId: string;
  };
}

// Task related types
export interface GuestyTask {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'inProgress' | 'completed' | 'canceled';
  priority: 'low' | 'medium' | 'high';
  due: string; // ISO date string
  assigneeId: string;
  listingId: string;
  reservationId?: string;
  integration?: {
    platform: string;
    externalId: string;
  };
}

// User related types
export interface GuestyUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
}
