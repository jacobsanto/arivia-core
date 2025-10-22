import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  InventoryItem, 
  InventoryTransfer, 
  PurchaseOrder, 
  InventoryStats,
  StockFilters,
  TransferFilters,
  OrderFilters
} from "@/types/inventory.types";
import { toastService } from "@/services/toast";

export const useInventory = () => {
  const queryClient = useQueryClient();
  
  // Filters state
  const [stockFilters, setStockFilters] = useState<StockFilters>({
    search: '',
    category: 'all',
    location: 'all',
    low_stock_only: false,
    sort_by: 'name',
    sort_order: 'asc'
  });

  const [transferFilters, setTransferFilters] = useState<TransferFilters>({
    status: 'all',
    location: 'all',
    date_range: 'all'
  });

  const [orderFilters, setOrderFilters] = useState<OrderFilters>({
    status: 'all',
    vendor: 'all',
    date_range: 'all'
  });

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(name)
        `)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        category: item.category?.name || 'Uncategorized',
        current_stock: Number(item.quantity) || 0,
        reorder_level: Number(item.min_quantity) || 0,
        unit_cost: Number(item.unit_cost) || 0,
        location: item.storage_location
      })) as InventoryItem[];
    },
    refetchInterval: 30000,
  });

  // Fetch transfers (mock data for now)
  const { data: transfers = [], isLoading: transfersLoading } = useQuery({
    queryKey: ['inventory-transfers'],
    queryFn: async () => {
      // Mock data - replace with actual Supabase query when table exists
      return [
        {
          id: '1',
          transfer_number: 'TR-2024-001',
          from_location: 'Main Storage',
          to_location: 'Villa Eros',
          status: 'pending_approval' as const,
          requested_by: 'housekeeping@arivia.com',
          items: [
            { id: '1', item_id: '1', item_name: 'Bath Towels', quantity_requested: 10, unit_cost: 25 },
            { id: '2', item_id: '2', item_name: 'Bed Sheets', quantity_requested: 5, unit_cost: 40 }
          ],
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          transfer_number: 'TR-2024-002',
          from_location: 'Villa Caldera',
          to_location: 'Main Storage',
          status: 'completed' as const,
          requested_by: 'maintenance@arivia.com',
          approved_by: 'manager@arivia.com',
          items: [
            { id: '3', item_id: '3', item_name: 'Cleaning Supplies', quantity_requested: 3, quantity_approved: 3, unit_cost: 15 }
          ],
          requested_at: new Date(Date.now() - 86400000).toISOString(),
          approved_at: new Date(Date.now() - 43200000).toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as InventoryTransfer[];
    }
  });

  // Fetch purchase orders (mock data for now)
  const { data: purchaseOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      // Mock data - replace with actual Supabase query when table exists
      return [
        {
          id: '1',
          po_number: 'PO-2024-001',
          vendor_name: 'Hotel Supply Co',
          status: 'pending_approval' as const,
          created_by: 'manager@arivia.com',
          items: [
            { id: '1', item_id: '1', item_name: 'Bath Towels', quantity_ordered: 50, unit_cost: 25, total_cost: 1250 },
            { id: '2', item_id: '2', item_name: 'Toilet Paper', quantity_ordered: 100, unit_cost: 8, total_cost: 800 }
          ],
          subtotal: 2050,
          total_amount: 2050,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          po_number: 'PO-2024-002',
          vendor_name: 'Clean Pro Supplies',
          status: 'completed' as const,
          created_by: 'admin@arivia.com',
          approved_by: 'manager@arivia.com',
          items: [
            { id: '3', item_id: '3', item_name: 'All-Purpose Cleaner', quantity_ordered: 20, unit_cost: 12, total_cost: 240 }
          ],
          subtotal: 240,
          total_amount: 240,
          ordered_at: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as PurchaseOrder[];
    }
  });

  // Calculate statistics
  const stats = useMemo((): InventoryStats => {
    const lowStockItems = inventoryItems.filter(item => 
      item.current_stock <= item.reorder_level
    );
    
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.current_stock * item.unit_cost), 0
    );

    const pendingTransfers = transfers.filter(t => 
      t.status === 'pending_approval'
    ).length;

    const pendingOrders = purchaseOrders.filter(po => 
      po.status === 'pending_approval'
    ).length;

    const monthlySpending = purchaseOrders
      .filter(po => po.status === 'completed')
      .reduce((sum, po) => sum + po.total_amount, 0);

    return {
      total_items: inventoryItems.length,
      low_stock_items: lowStockItems.length,
      pending_transfers: pendingTransfers,
      pending_orders: pendingOrders,
      total_inventory_value: totalValue,
      monthly_spending: monthlySpending
    };
  }, [inventoryItems, transfers, purchaseOrders]);

  // Filter inventory items
  const filteredItems = useMemo(() => {
    let filtered = [...inventoryItems];

    // Search filter
    if (stockFilters.search) {
      const search = stockFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.sku && item.sku.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (stockFilters.category !== 'all') {
      filtered = filtered.filter(item => item.category === stockFilters.category);
    }

    // Location filter
    if (stockFilters.location !== 'all') {
      filtered = filtered.filter(item => item.location === stockFilters.location);
    }

    // Low stock filter
    if (stockFilters.low_stock_only) {
      filtered = filtered.filter(item => item.current_stock <= item.reorder_level);
    }

    // Sort
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (stockFilters.sort_by) {
        case 'stock':
          valueA = a.current_stock;
          valueB = b.current_stock;
          break;
        case 'value':
          valueA = a.current_stock * a.unit_cost;
          valueB = b.current_stock * b.unit_cost;
          break;
        case 'updated_at':
          valueA = new Date(a.updated_at);
          valueB = new Date(b.updated_at);
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (stockFilters.sort_order === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filtered;
  }, [inventoryItems, stockFilters]);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    let filtered = [...transfers];

    if (transferFilters.status !== 'all') {
      filtered = filtered.filter(t => t.status === transferFilters.status);
    }

    return filtered;
  }, [transfers, transferFilters]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...purchaseOrders];

    if (orderFilters.status !== 'all') {
      filtered = filtered.filter(po => po.status === orderFilters.status);
    }

    return filtered;
  }, [purchaseOrders, orderFilters]);

  // Mutations for updates
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toastService.success('Item updated successfully');
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toastService.error('Failed to update item');
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          name: item.name,
          sku: item.sku,
          category_id: item.category_id,
          quantity: item.current_stock,
          min_quantity: item.reorder_level,
          target_quantity: item.target_quantity,
          unit_cost: item.unit_cost,
          supplier: item.vendor,
          storage_location: item.location || item.storage_location
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toastService.success('Item created successfully');
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toastService.error('Failed to create item');
    }
  });

  return {
    // Data
    inventoryItems: filteredItems,
    transfers: filteredTransfers,
    purchaseOrders: filteredOrders,
    stats,
    
    // Loading states
    itemsLoading,
    transfersLoading,
    ordersLoading,
    
    // Filters
    stockFilters,
    setStockFilters,
    transferFilters,
    setTransferFilters,
    orderFilters,
    setOrderFilters,
    
    // Mutations
    updateItem: updateItemMutation.mutate,
    createItem: createItemMutation.mutate,
    isUpdating: updateItemMutation.isPending,
    isCreating: createItemMutation.isPending
  };
};