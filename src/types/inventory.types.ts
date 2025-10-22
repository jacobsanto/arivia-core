export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category_id?: string;
  category?: string;
  current_stock: number;
  reorder_level: number;
  target_quantity?: number;
  unit_cost: number;
  unit?: string;
  vendor?: string;
  location?: string;
  storage_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransfer {
  id: string;
  transfer_number: string;
  from_location: string;
  to_location: string;
  status: 'pending_approval' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  requested_by: string;
  approved_by?: string;
  items: TransferItem[];
  notes?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity_requested: number;
  quantity_approved?: number;
  unit_cost?: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id?: string;
  vendor_name: string;
  status: 'pending_approval' | 'approved' | 'ordered' | 'received' | 'completed' | 'cancelled';
  created_by: string;
  approved_by?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  ordered_at?: string;
  expected_delivery?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity_ordered: number;
  unit_cost: number;
  total_cost: number;
  quantity_received?: number;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  categories: string[];
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  pending_transfers: number;
  pending_orders: number;
  total_inventory_value: number;
  monthly_spending: number;
}

export interface StockFilters {
  search: string;
  category: string;
  location: string;
  low_stock_only: boolean;
  sort_by: 'name' | 'stock' | 'value' | 'updated_at';
  sort_order: 'asc' | 'desc';
}

export interface TransferFilters {
  status: string;
  location: string;
  date_range: string;
}

export interface OrderFilters {
  status: string;
  vendor: string;
  date_range: string;
}