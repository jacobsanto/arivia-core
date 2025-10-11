import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

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
      logger.error('Error fetching inventory categories', error);
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
      logger.error("Error fetching inventory items", error, { component: 'inventoryService' });
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
      logger.error("Error creating inventory category", error, { component: 'inventoryService' });
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
      logger.error("Error creating inventory item", error, { component: 'inventoryService' });
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
      const { error } = await supabase
        .from('inventory_usage')
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
        logger.error("Error recording inventory usage", error, { component: 'inventoryService' });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error("Error recording inventory usage", error, { component: 'inventoryService' });
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
    try {
      const { data, error } = await supabase
        .from('inventory_usage')
        .select(`
          *,
          inventory_items:item_id (name),
          properties:property_id (name),
          profiles:reported_by (name)
        `)
        .order('usage_date', { ascending: false });
      
      if (error) {
        logger.error("Error fetching inventory usage", error, { component: 'inventoryService' });
        return [];
      }
      
      return (data || []).map(item => ({
        id: item.id,
        date: item.usage_date || '',
        item: item.inventory_items?.name || 'Unknown Item',
        category: 'General',
        quantity: item.quantity_used,
        property: item.properties?.name || 'Unknown Property',
        reported_by: item.profiles?.name || 'Unknown User'
      }));
    } catch (error) {
      logger.error("Error fetching inventory usage", error, { component: 'inventoryService' });
      return [];
    }
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