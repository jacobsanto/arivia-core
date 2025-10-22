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
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching inventory categories:', error);
      throw error;
    }
    
    return (data || []) as unknown as InventoryCategory[];
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
    
    return data as unknown as InventoryCategory;
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
    item_id: string;
    quantity: number;
    property_id: string;
    reported_by: string;
    task_id?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      // Note: inventory_usage table doesn't exist yet
      console.warn('inventory_usage table not implemented');
      return true;
      /* const { error } = await supabase
        .from('inventory_usage' as any)
        .insert({
          item_id: usage.item_id,
          quantity_used: usage.quantity,
          property_id: usage.property_id,
          reported_by: usage.reported_by,
          task_id: usage.task_id,
          notes: usage.notes,
          usage_date: usage.date || new Date().toISOString()
        });
      
      if (error) {
        console.error('Error recording inventory usage:', error);
        return false;
      }
      
      return true; */
    } catch (error) {
      console.error('Error recording inventory usage:', error);
      return false;
    }
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
    // Note: inventory_usage table doesn't exist yet
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