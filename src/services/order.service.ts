import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  vendor_id: string;
  order_date: string;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  async getItemsByVendor(vendorId: string | null): Promise<any[]> {
    if (!vendorId) return [];
    
    // Return inventory items that match the vendor
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('vendor', vendorId);
    
    if (error) {
      console.error('Error fetching vendor items:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      category: 'General'
    }));
  },

  async createOrder(orderData: any, items: any[]): Promise<any> {
    // Create a simplified order for now
    const order = {
      id: `order-${Date.now()}`,
      ...orderData,
      created_at: new Date().toISOString(),
      items: items
    };
    
    // In a real app, this would save to the database
    console.log('Order created:', order);
    return order;
  },

  async getOrders(): Promise<any[]> {
    // Return empty array for now - in production this would fetch from database
    return [];
  }
};