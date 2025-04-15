
/**
 * Type definitions for Guesty API responses
 */

// Property Types
export interface GuestyProperty {
  _id: string;
  title: string;
  picture?: {
    thumbnail: string;
    regular: string;
    large: string;
  };
  address: {
    full: string;
    street?: string;
    city?: string;
    country?: string;
    zipcode?: string;
    lat?: number;
    lng?: number;
  };
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  price?: number; // Add optional price field
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  active: boolean;
}

// Reservation Types
export interface GuestyReservation {
  _id: string;
  status: 'inquiry' | 'pendingOwnerConfirmation' | 'canceled' | 'confirmed' | 'declined';
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  nightsCount: number;
  guestCount: number;
  money: {
    totalPaid: number;
    currency: string;
    totalPrice: number;
  };
  guest: GuestyGuest;
  listing: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Guest Types
export interface GuestyGuest {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  picture?: string;
  address?: {
    country?: string;
    city?: string;
    street?: string;
    zipcode?: string;
  };
}

// Task Types
export interface GuestyTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'inProgress' | 'completed' | 'canceled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  taskType?: string;
  listing?: {
    _id: string;
    title: string;
  };
  assignee?: {
    _id: string;
    fullName: string;
  };
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination Types
export interface GuestyPaginatedResponse<T> {
  results: T[];
  count: number;
  limit: number;
  skip: number;
  total: number;
}
