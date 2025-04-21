
export interface Property {
  id: string;
  name: string;
  location: string;
  status: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  imageUrl: string;
  description?: string;
  address: string;
  max_guests: number;
  price_per_night: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  address: string;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  max_guests: number;
  imageUrl: string;
  description?: string;
}
