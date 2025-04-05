
import React, { useState } from "react";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import InventoryOverview from "@/components/inventory/InventoryOverview";
import StockLevels from "@/components/inventory/StockLevels";
import AddItem from "@/components/inventory/AddItem";
import StockReceipt from "@/components/inventory/StockReceipt";
import StockTransfer from "@/components/inventory/StockTransfer";
import InventoryUsage from "@/components/inventory/InventoryUsage";
import VendorsList from "@/components/inventory/vendors/VendorsList";
import OrderForm from "@/components/inventory/orders/OrderForm";
import OrderList from "@/components/inventory/orders/OrderList";
import { InventoryProvider } from "@/contexts/InventoryContext";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <InventoryProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage supplies across main storage and property locations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="bg-transparent -mb-px">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
              <TabsTrigger value="add-item">Add Item</TabsTrigger>
              <TabsTrigger value="receipts">Stock Receipt</TabsTrigger>
              <TabsTrigger value="transfers">Transfer Stock</TabsTrigger>
              <TabsTrigger value="usage">Usage Reports</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
          </div>
          
          <Card className="mt-6 border-t-0 rounded-t-none">
            <CardContent className="pt-6">
              <TabsContent value="overview" className="mt-0">
                <InventoryOverview />
              </TabsContent>
              
              <TabsContent value="stock-levels" className="mt-0">
                <StockLevels />
              </TabsContent>
              
              <TabsContent value="add-item" className="mt-0">
                <AddItem />
              </TabsContent>
              
              <TabsContent value="receipts" className="mt-0">
                <StockReceipt />
              </TabsContent>
              
              <TabsContent value="transfers" className="mt-0">
                <StockTransfer />
              </TabsContent>
              
              <TabsContent value="usage" className="mt-0">
                <InventoryUsage />
              </TabsContent>
              
              <TabsContent value="vendors" className="mt-0">
                <VendorsList />
              </TabsContent>
              
              <TabsContent value="orders" className="mt-0">
                <div className="grid gap-6">
                  <OrderList />
                  <OrderForm />
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </InventoryProvider>
  );
};

export default Inventory;
