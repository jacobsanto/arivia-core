import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItem } from "@/types/inventory.types";

interface ManageItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onClose?: () => void;
}

export const ManageItemModal: React.FC<ManageItemModalProps> = ({
  isOpen,
  onOpenChange,
  item,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    sku: item?.sku || '',
    category: item?.category || '',
    current_stock: item?.current_stock || 0,
    reorder_level: item?.reorder_level || 0,
    target_quantity: item?.target_quantity || 0,
    unit_cost: item?.unit_cost || 0,
    unit: item?.unit || 'Each',
    vendor: item?.vendor || '',
    location: item?.location || 'main',
    notes: item?.notes || ''
  });

  const { createItem, updateItem, isCreating, isUpdating } = useInventory();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Unit options
  const unitOptions = ['Each', 'Box', 'Pack', 'Bottle', 'Kg', 'L', 'Set', 'Roll', 'Pair'];

  // Location options
  const locationOptions = ['main', 'villa_caldera', 'villa_eros', 'villa_azure'];

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        current_stock: item.current_stock || 0,
        reorder_level: item.reorder_level || 0,
        target_quantity: item.target_quantity || 0,
        unit_cost: item.unit_cost || 0,
        unit: item.unit || 'Each',
        vendor: item.vendor || '',
        location: item.location || 'main',
        notes: item.notes || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        current_stock: 0,
        reorder_level: 0,
        target_quantity: 0,
        unit_cost: 0,
        unit: 'Each',
        vendor: '',
        location: 'main',
        notes: ''
      });
    }
  }, [item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    try {
      if (item) {
        // Update existing item
        updateItem({
          id: item.id,
          updates: {
            name: formData.name,
            sku: formData.sku || undefined,
            current_stock: formData.current_stock,
            reorder_level: formData.reorder_level,
            target_quantity: formData.target_quantity,
            unit_cost: formData.unit_cost,
            unit: formData.unit,
            vendor: formData.vendor || undefined,
            location: formData.location,
            notes: formData.notes || undefined
          }
        });
      } else {
        // Create new item
        createItem({
          name: formData.name,
          sku: formData.sku || undefined,
          category: formData.category,
          current_stock: formData.current_stock,
          reorder_level: formData.reorder_level,
          target_quantity: formData.target_quantity,
          unit_cost: formData.unit_cost,
          unit: formData.unit,
          vendor: formData.vendor || undefined,
          location: formData.location,
          notes: formData.notes || undefined
        } as any);
      }
      
      onOpenChange(false);
      onClose?.();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update the inventory item details' : 'Add a new item to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Bath Towels"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="e.g., BT-001"
              />
            </div>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Linens">Linens</SelectItem>
                  <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                  <SelectItem value="Toiletries">Toiletries</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleInputChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Storage</SelectItem>
                  <SelectItem value="villa_caldera">Villa Caldera</SelectItem>
                  <SelectItem value="villa_eros">Villa Eros</SelectItem>
                  <SelectItem value="villa_azure">Villa Azure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => handleInputChange('reorder_level', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="target_quantity">Target Quantity</Label>
              <Input
                id="target_quantity"
                type="number"
                min="0"
                value={formData.target_quantity}
                onChange={(e) => handleInputChange('target_quantity', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Unit and Cost */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost (€)</Label>
              <Input
                id="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="e.g., Hotel Supply Co"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this item..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};