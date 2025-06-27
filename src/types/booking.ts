
export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numGuests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";
