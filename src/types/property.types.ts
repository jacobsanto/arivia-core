
import { GuestyProperty } from '@/integrations/guesty/types';

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
  guesty_id?: string;
  guesty_data?: GuestyProperty;
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
