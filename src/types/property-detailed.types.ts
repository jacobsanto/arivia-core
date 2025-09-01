// Enhanced property types for the comprehensive Properties page system

export interface PropertyImage {
  id: string;
  url: string;
  title: string;
  is_hero: boolean;
  order_index: number;
}

export interface PropertyAmenity {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export interface PropertyTaskSummary {
  housekeeping: number;
  maintenance: number;
  damage_reports: number;
}

export interface PropertyFinancialSummary {
  total_costs: number;
  maintenance_costs: number;
  damage_costs: number;
  expense_distribution: {
    maintenance: number;
    damages: number;
  };
}

export interface DetailedProperty {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: 'occupied' | 'vacant' | 'maintenance' | 'cleaning';
  room_status: 'dirty' | 'cleaning' | 'cleaned' | 'inspected' | 'ready';
  
  // Basic specs
  num_bedrooms: number;
  num_bathrooms: number;
  max_guests: number;
  square_feet?: number;
  
  // Rich content
  description: string;
  notes: string;
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  
  // Operational data
  open_tasks: PropertyTaskSummary;
  financial_summary: PropertyFinancialSummary;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_occupied?: string;
  next_checkin?: string;
}

export interface PropertyListItem {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: string;
  room_status: string;
  num_bedrooms: number;
  num_bathrooms: number;
  hero_image?: string;
  open_issues_count: number;
  urgent_issues_count: number;
}

export interface PropertyFilters {
  search: string;
  status: string;
  room_status: string;
  property_type: string;
  bedrooms: string;
  has_issues: boolean;
}

export interface PropertyViewMode {
  mode: 'grid' | 'list';
  sort_by: 'name' | 'status' | 'room_status' | 'issues' | 'type';
  sort_direction: 'asc' | 'desc';
}

// All available amenities in the system
export const ALL_AMENITIES: PropertyAmenity[] = [
  // Featured amenities
  { id: 'pool', name: 'Private Pool', category: 'featured', icon: 'Waves' },
  { id: 'beach_access', name: 'Beach Access', category: 'featured', icon: 'Umbrella' },
  { id: 'sea_view', name: 'Sea View', category: 'featured', icon: 'Eye' },
  { id: 'wifi', name: 'Free WiFi', category: 'featured', icon: 'Wifi' },
  { id: 'parking', name: 'Free Parking', category: 'featured', icon: 'Car' },
  
  // Kitchen amenities
  { id: 'full_kitchen', name: 'Full Kitchen', category: 'kitchen', icon: 'ChefHat' },
  { id: 'dishwasher', name: 'Dishwasher', category: 'kitchen', icon: 'Utensils' },
  { id: 'microwave', name: 'Microwave', category: 'kitchen', icon: 'Microwave' },
  { id: 'coffee_machine', name: 'Coffee Machine', category: 'kitchen', icon: 'Coffee' },
  { id: 'refrigerator', name: 'Refrigerator', category: 'kitchen', icon: 'Refrigerator' },
  
  // Entertainment
  { id: 'tv', name: 'Smart TV', category: 'entertainment', icon: 'Tv' },
  { id: 'netflix', name: 'Netflix', category: 'entertainment', icon: 'Play' },
  { id: 'sound_system', name: 'Sound System', category: 'entertainment', icon: 'Speaker' },
  { id: 'game_console', name: 'Game Console', category: 'entertainment', icon: 'Gamepad2' },
  
  // Comfort
  { id: 'air_conditioning', name: 'Air Conditioning', category: 'comfort', icon: 'Snowflake' },
  { id: 'heating', name: 'Heating', category: 'comfort', icon: 'Flame' },
  { id: 'fireplace', name: 'Fireplace', category: 'comfort', icon: 'Flame' },
  { id: 'balcony', name: 'Balcony/Terrace', category: 'comfort', icon: 'Home' },
  
  // Safety & Security
  { id: 'smoke_detector', name: 'Smoke Detector', category: 'safety', icon: 'Shield' },
  { id: 'security_system', name: 'Security System', category: 'safety', icon: 'ShieldCheck' },
  { id: 'safe', name: 'Safe', category: 'safety', icon: 'Lock' },
  { id: 'first_aid', name: 'First Aid Kit', category: 'safety', icon: 'Plus' },
  
  // Laundry & Cleaning
  { id: 'washing_machine', name: 'Washing Machine', category: 'laundry', icon: 'WashingMachine' },
  { id: 'dryer', name: 'Dryer', category: 'laundry', icon: 'Wind' },
  { id: 'iron', name: 'Iron & Board', category: 'laundry', icon: 'Shirt' },
  { id: 'cleaning_supplies', name: 'Basic Cleaning Supplies', category: 'laundry', icon: 'Spray' }
];

export const AMENITY_CATEGORIES = [
  { id: 'featured', name: 'Featured', description: 'Key highlights of the property' },
  { id: 'kitchen', name: 'Kitchen', description: 'Cooking and dining facilities' },
  { id: 'entertainment', name: 'Entertainment', description: 'Media and recreational amenities' },
  { id: 'comfort', name: 'Comfort', description: 'Climate and comfort features' },
  { id: 'safety', name: 'Safety & Security', description: 'Safety and security features' },
  { id: 'laundry', name: 'Laundry & Cleaning', description: 'Laundry and cleaning facilities' }
];