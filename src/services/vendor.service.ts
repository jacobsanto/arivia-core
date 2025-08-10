import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface VendorWithCategoryNames extends Omit<Vendor, 'categories'> {
  categories: string[];
  category_names?: string[];
}

export const vendorService = {
  async getVendors(): Promise<VendorWithCategoryNames[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
    
    // Get category names separately
    const vendorsWithNames = await Promise.all(
      (data || []).map(async (vendor) => {
        if (vendor.categories && vendor.categories.length > 0) {
          const { data: categoryData } = await supabase
            .from('inventory_categories')
            .select('name')
            .in('id', vendor.categories);
          
          return {
            ...vendor,
            category_names: categoryData?.map(cat => cat.name) || []
          };
        }
        return {
          ...vendor,
          category_names: []
        };
      })
    );
    
    return vendorsWithNames;
  },

  async getVendorsByCategory(categoryId: string): Promise<VendorWithCategoryNames[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .contains('categories', [categoryId])
      .order('name');
    
    if (error) {
      console.error('Error fetching vendors by category:', error);
      throw error;
    }
    
    // Get category names separately
    const vendorsWithNames = await Promise.all(
      (data || []).map(async (vendor) => {
        if (vendor.categories && vendor.categories.length > 0) {
          const { data: categoryData } = await supabase
            .from('inventory_categories')
            .select('name')
            .in('id', vendor.categories);
          
          return {
            ...vendor,
            category_names: categoryData?.map(cat => cat.name) || []
          };
        }
        return {
          ...vendor,
          category_names: []
        };
      })
    );
    
    return vendorsWithNames;
  },

  async createVendor(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
    
    return data;
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
    
    return data;
  },

  async deleteVendor(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
    
    return true;
  }
};