
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  current_stock: number;
  min_level: number;
  vendor_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryUsage {
  id: string;
  date: string;
  property: string;
  item: string;
  category: string;
  quantity: number;
  reported_by: string;
  created_at?: string;
}

export const inventoryService = {
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Map DB column names to our interface properties
      const items: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        location: item.location || 'main',
        current_stock: item.current_stock || 0,
        min_level: item.min_level || 0,
        vendor_ids: item.vendor_ids || [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return items;
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
      
      // Map DB column names to our interface properties
      return {
        id: data.id,
        name: data.name,
        category: data.category || '',
        location: data.location || 'main',
        current_stock: data.current_stock || 0,
        min_level: data.min_level || 0,
        vendor_ids: data.vendor_ids || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error: any) {
      console.error(`Error fetching inventory item with id ${id}:`, error);
      return null;
    }
  },

  async getInventoryItemsByLocation(location: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('location', location)
        .order('name');

      if (error) throw error;
      
      // Map DB column names to our interface properties
      const items: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        location: item.location || location,
        current_stock: item.current_stock || 0,
        min_level: item.min_level || 0,
        vendor_ids: item.vendor_ids || [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return items;
    } catch (error: any) {
      console.error(`Error fetching inventory items for location ${location}:`, error);
      return [];
    }
  },

  async getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) throw error;
      
      // Map DB column names to our interface properties
      const items: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || category,
        location: item.location || 'main',
        current_stock: item.current_stock || 0,
        min_level: item.min_level || 0,
        vendor_ids: item.vendor_ids || [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return items;
    } catch (error: any) {
      console.error(`Error fetching inventory items for category ${category}:`, error);
      return [];
    }
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
    try {
      // Map our interface properties to DB column names
      const dbItem = {
        name: item.name,
        category: item.category,
        location: item.location,
        current_stock: item.current_stock,
        min_level: item.min_level,
        vendor_ids: item.vendor_ids
      };
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(dbItem)
        .select()
        .single();

      if (error) throw error;
      toast.success('Inventory item added successfully');
      
      // Map DB response back to our interface
      return {
        id: data.id,
        name: data.name,
        category: data.category || '',
        location: data.location || 'main',
        current_stock: data.current_stock || 0,
        min_level: data.min_level || 0,
        vendor_ids: data.vendor_ids || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: updates.name,
          category: updates.category,
          location: updates.location,
          current_stock: updates.current_stock,
          min_level: updates.min_level,
          vendor_ids: updates.vendor_ids
        })
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
        .insert(usage);

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
        .select('category');

      if (error) throw error;
      
      // Extract unique categories
      const categories = new Set(data.map(item => item.category));
      return Array.from(categories).sort();
    } catch (error: any) {
      console.error('Error fetching unique categories:', error);
      return [];
    }
  },

  async getUniqueLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('location');

      if (error) throw error;
      
      // Extract unique locations
      const locations = new Set(data.map(item => item.location));
      return Array.from(locations).sort();
    } catch (error: any) {
      console.error('Error fetching unique locations:', error);
      return [];
    }
  },
};
