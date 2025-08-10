import { supabase } from "@/integrations/supabase/client";

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  min_quantity: number;
  target_quantity?: number;
  unit?: string;
  unit_cost?: number;
  vendor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const inventoryService = {
  async getCategories(): Promise<InventoryCategory[]> {
    // Return empty array since categories table doesn't exist
    return [];
  },

  async getItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
    
    return data || [];
  },

  async createCategory(name: string, description?: string): Promise<InventoryCategory | null> {
    // Categories table doesn't exist, return null
    return null;
  },

  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
    
    return data;
  },

  // Inventory usage APIs
  async recordInventoryUsage(usage: {
    date?: string;
    item: string;
    category: string;
    quantity: number;
    property: string;
    reported_by: string;
  }): Promise<boolean> {
    // Usage table doesn't exist, return true
    return true;
  },

  async getInventoryUsageHistory(): Promise<Array<{
    id: string;
    date: string;
    item: string;
    category: string;
    quantity: number;
    property: string;
    reported_by: string;
  }>> {
    // Usage table doesn't exist, return empty array
    return [];
  },

  async getUniqueLocations(): Promise<string[]> {
    // Until locations are modeled in DB, return a static list used in UI
    return [
      'main',
      'villa_caldera',
      'villa_oceana',
      'villa_azure',
      'villa_sunset',
      'villa_paradiso'
    ];
  }
};