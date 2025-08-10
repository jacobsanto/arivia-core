
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
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
import { OrderProvider } from "@/contexts/OrderContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileInventory from "@/components/inventory/MobileInventory";
import { InventoryErrorBoundary } from "@/components/error-boundaries/InventoryErrorBoundary";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-usage"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const canonicalUrl = typeof window !== "undefined" ? `${window.location.origin}/inventory` : "/inventory";
  const helmet = (
    <Helmet>
      <title>Inventory Management | Arivia Villas</title>
      <meta name="description" content="Track stock levels, receipts, transfers, vendors, orders and usage across Arivia Villas." />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );

  // Render mobile-specific UI
  if (isMobile) {
    return (
      <InventoryErrorBoundary>
        {helmet}
        <MobileInventory />
      </InventoryErrorBoundary>
    );
  }

  // Desktop UI
  return (
    <InventoryErrorBoundary>
      <InventoryProvider>
        <OrderProvider>
          <main className="space-y-6 p-4 md:p-6">
            {helmet}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Inventory Management</h1>
                <p className="text-muted-foreground">
                  Manage supplies across main storage and property locations
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                {refreshing ? "Refreshing" : "Refresh"}
              </Button>
            </header>

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
                  <TabsTrigger value="create-order">Create Order</TabsTrigger>
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
                    <OrderList />
                  </TabsContent>
                  
                  <TabsContent value="create-order" className="mt-0">
                    <OrderForm />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </main>
        </OrderProvider>
      </InventoryProvider>
    </InventoryErrorBoundary>
  );
};

export default Inventory;
