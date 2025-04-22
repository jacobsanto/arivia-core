
// Original Property type
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

// New GuestyProperty type to represent a property from Guesty
export interface GuestyProperty {
  id: string;
  title: string;
  address?: {
    full?: string;
  };
  status?: string;
  thumbnail_url?: string;
  highres_url?: string; // <-- new: support high-res url if available
  property_type?: string;
  sync_status?: string;
  last_synced?: string;
  raw_data?: any;
}

// Unified property model that works with both sources
export interface UnifiedProperty extends Property {
  source: 'guesty' | 'local';
  guesty_id?: string;
  last_synced?: string;
  next_check_in?: string | null;
  has_active_cleaning?: boolean;
  raw_data?: any; // Added to access additional data like area
}
