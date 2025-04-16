
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItemDB {
  id: string;
  name: string;
  description: string;
  category_id: string;
  min_quantity: number;
  unit: string;
  item_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  current_stock: number;
  min_level: number;
  unit: string;
  item_code?: string;
  vendor_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryUsage {
  id?: string;
  date?: string;
  item: string;
  category: string;
  quantity: number;
  property: string;
  reported_by: string;
  created_at?: string;
}

const mapDbItemToClientItem = (dbItem: InventoryItemDB): InventoryItem => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description || '',
    category: dbItem.category_id,
    location: 'Main Storage', // Default location since it's not in DB
    current_stock: 0, // Default stock since it's not in DB
    min_level: dbItem.min_quantity,
    unit: dbItem.unit,
    item_code: dbItem.item_code || undefined,
    vendor_ids: [],
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at
  };
};

const mapClientItemToDbItem = (clientItem: Partial<InventoryItem>): { category_id: string; name: string; description?: string; min_quantity: number; unit: string; item_code?: string } => {
  return {
    name: clientItem.name!,
    description: clientItem.description,
    category_id: clientItem.category!,
    min_quantity: clientItem.min_level!,
    unit: clientItem.unit!,
    item_code: clientItem.item_code
  };
};

export const inventoryService = {
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      
      return (data || []).map(mapDbItemToClientItem);
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      toast.error('Failed to load inventory items', {
        description: error.message
      });
      return [];
    }
  },

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return mapDbItemToClientItem(data);
    } catch (error: any) {
      console.error(`Error fetching inventory item with id ${id}:`, error);
      return null;
    }
  },

  async getInventoryItemsByCategory(categoryId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      
      return (data || []).map(mapDbItemToClientItem);
    } catch (error: any) {
      console.error(`Error fetching inventory items for category ${categoryId}:`, error);
      return [];
    }
  },

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');

      if (error) throw error;
      
      return (data || []).map(mapDbItemToClientItem);
    } catch (error: any) {
      console.error(`Error searching inventory items with query ${query}:`, error);
      return [];
    }
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
    try {
      const dbItem = mapClientItemToDbItem(item);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(dbItem)
        .select()
        .single();

      if (error) throw error;
      toast.success('Inventory item added successfully');
      
      return mapDbItemToClientItem(data);
    } catch (error: any) {
      console.error('Error adding inventory item:', error);
      toast.error('Failed to add inventory item', {
        description: error.message
      });
      return null;
    }
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<boolean> {
    try {
      // Convert client model to database model
      const dbUpdates: Partial<InventoryItemDB> = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.category) dbUpdates.category_id = updates.category;
      if (updates.min_level !== undefined) dbUpdates.min_quantity = updates.min_level;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.item_code !== undefined) dbUpdates.item_code = updates.item_code;

      const { error } = await supabase
        .from('inventory_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Inventory item updated successfully');
      return true;
    } catch (error: any) {
      console.error(`Error updating inventory item with id ${id}:`, error);
      toast.error('Failed to update inventory item', {
        description: error.message
      });
      return false;
    }
  },

  async deleteInventoryItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Inventory item deleted successfully');
      return true;
    } catch (error: any) {
      console.error(`Error deleting inventory item with id ${id}:`, error);
      toast.error('Failed to delete inventory item', {
        description: error.message
      });
      return false;
    }
  },

  async recordInventoryUsage(usage: Omit<InventoryUsage, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory_usage')
        .insert({
          item: usage.item,
          category: usage.category,
          quantity: usage.quantity,
          property: usage.property,
          reported_by: usage.reported_by,
          date: usage.date
        });

      if (error) throw error;
      toast.success('Inventory usage recorded successfully');
      return true;
    } catch (error: any) {
      console.error('Error recording inventory usage:', error);
      toast.error('Failed to record inventory usage', {
        description: error.message
      });
      return false;
    }
  },

  async getInventoryUsageHistory(): Promise<InventoryUsage[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_usage')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as InventoryUsage[] || [];
    } catch (error: any) {
      console.error('Error fetching inventory usage history:', error);
      toast.error('Failed to load inventory usage history', {
        description: error.message
      });
      return [];
    }
  },

  async getUniqueCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('category_id');

      if (error) throw error;
      
      const categories = new Set(data.map(item => item.category_id));
      return Array.from(categories).sort();
    } catch (error: any) {
      console.error('Error fetching unique categories:', error);
      return [];
    }
  },

  // This function doesn't use the DB directly since 'location' isn't in inventory_items table
  async getUniqueLocations(): Promise<string[]> {
    try {
      // For now, just return static locations until we have a locations table
      return ["Main Storage", "Villa Caldera", "Villa Oceana", "Villa Azure", "Villa Sunset", "Villa Paradiso"];
    } catch (error: any) {
      console.error('Error fetching unique locations:', error);
      return [];
    }
  },
};
