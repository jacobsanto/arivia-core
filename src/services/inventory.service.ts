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
  description?: string;
  category_id: string;
  unit: string;
  min_quantity: number;
  item_code?: string;
  created_at: string;
  updated_at: string;
}

export const inventoryService = {
  async getCategories(): Promise<InventoryCategory[]> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching inventory categories:', error);
      throw error;
    }
    
    return data || [];
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
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert({ name, description })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inventory category:', error);
      throw error;
    }
    
    return data;
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
    const { error } = await supabase
      .from('inventory_usage')
      .insert({
        date: usage.date,
        item: usage.item,
        category: usage.category,
        quantity: usage.quantity,
        property: usage.property,
        reported_by: usage.reported_by,
      });
    
    if (error) {
      console.error('Error recording inventory usage:', error);
      return false;
    }
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
    const { data, error } = await supabase
      .from('inventory_usage')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching inventory usage history:', error);
      return [];
    }
    return (data || []) as any;
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