import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Edit, 
  Eye, 
  Package,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { ManageItemModal } from "./ManageItemModal";
import { InventoryItem } from "@/types/inventory.types";

export const StockLevelsView: React.FC = () => {
  const { 
    inventoryItems, 
    stockFilters, 
    setStockFilters, 
    itemsLoading 
  } = useInventory();
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isManageItemOpen, setIsManageItemOpen] = useState(false);

  // Get unique categories and locations for filters
  const categories = [...new Set(inventoryItems.map(item => item.category))];
  const locations = [...new Set(inventoryItems.map(item => item.location))];

  const handleSearch = (value: string) => {
    setStockFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryFilter = (value: string) => {
    setStockFilters(prev => ({ ...prev, category: value }));
  };

  const handleLocationFilter = (value: string) => {
    setStockFilters(prev => ({ ...prev, location: value }));
  };

  const handleLowStockToggle = (checked: boolean) => {
    setStockFilters(prev => ({ ...prev, low_stock_only: checked }));
  };

  const handleSort = (field: any) => {
    setStockFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsManageItemOpen(true);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return { status: 'out-of-stock', color: 'bg-red-100 text-red-800 border-red-200', label: 'Out of Stock' };
    } else if (item.current_stock <= item.reorder_level) {
      return { status: 'low-stock', color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Low Stock' };
    } else if (item.current_stock <= item.reorder_level * 1.5) {
      return { status: 'moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Moderate' };
    } else {
      return { status: 'in-stock', color: 'bg-green-100 text-green-800 border-green-200', label: 'In Stock' };
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (stockFilters.sort_by !== field) return <SortAsc className="h-4 w-4 text-muted-foreground" />;
    return stockFilters.sort_order === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  if (itemsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Find and filter inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items or SKU..."
                value={stockFilters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={stockFilters.category} onValueChange={handleCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={stockFilters.location} onValueChange={handleLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Low Stock Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="low-stock"
                checked={stockFilters.low_stock_only}
                onCheckedChange={handleLowStockToggle}
              />
              <Label htmlFor="low-stock" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Low Stock Only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items ({inventoryItems.length})
          </CardTitle>
          <CardDescription>
            Master catalog of all inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p>Try adjusting your filters or add new inventory items.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-semibold"
                      >
                        Item <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('stock')}
                        className="h-auto p-0 font-semibold"
                      >
                        Stock <SortIcon field="stock" />
                      </Button>
                    </TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('value')}
                        className="h-auto p-0 font-semibold"
                      >
                        Value <SortIcon field="value" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const totalValue = item.current_stock * item.unit_cost;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.sku && (
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${stockStatus.status === 'out-of-stock' ? 'text-red-600' : stockStatus.status === 'low-stock' ? 'text-orange-600' : ''}`}>
                              {item.current_stock}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.unit}
                            </span>
                            {item.current_stock <= item.reorder_level && (
                              <TrendingDown className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.reorder_level} {item.unit}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">€{totalValue.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              €{item.unit_cost}/{item.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Item Modal */}
      <ManageItemModal
        isOpen={isManageItemOpen}
        onOpenChange={setIsManageItemOpen}
        item={selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setIsManageItemOpen(false);
        }}
      />
    </div>
  );
};