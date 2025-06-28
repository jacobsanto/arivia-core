
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import InventoryOverview from '@/components/inventory/InventoryOverview';
import InventoryItems from '@/components/inventory/InventoryItems';
import InventoryCategories from '@/components/inventory/InventoryCategories';
import InventoryVendors from '@/components/inventory/InventoryVendors';
import OrderList from '@/components/inventory/orders/OrderList';
import InventoryUsage from '@/components/inventory/InventoryUsage';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock orders data for OrderList component
  const mockOrders = [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Inventory Management - Arivia Villa Sync</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your property's inventory, track stock levels, and create purchase orders.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="items">
          <InventoryItems />
        </TabsContent>

        <TabsContent value="categories">
          <InventoryCategories />
        </TabsContent>

        <TabsContent value="vendors">
          <InventoryVendors />
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Purchase Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Manage inventory purchase orders
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </div>
            <OrderList orders={mockOrders} />
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <InventoryUsage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
