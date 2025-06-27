
export interface Property {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  description?: string;
  numBedrooms: number;
  numBathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  status: PropertyStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyStatus = 
  | "active"
  | "inactive"
  | "maintenance";
