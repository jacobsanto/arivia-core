
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, TrendingUp, ShoppingCart, Truck } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Import components
import InventoryOverview from "@/components/inventory/InventoryOverview";
import StockLevels from "@/components/inventory/StockLevels";
import AddItem from "@/components/inventory/AddItem";
import StockReceipt from "@/components/inventory/StockReceipt";
import StockTransfer from "@/components/inventory/StockTransfer";
import InventoryUsage from "@/components/inventory/InventoryUsage";
import OrderList from "@/components/inventory/orders/OrderList";
import OrderForm from "@/components/inventory/orders/OrderForm";
import VendorsList from "@/components/inventory/vendors/VendorsList";

// Mobile components
import MobileInventory from "@/components/inventory/MobileInventory";

const Inventory: React.FC = () => {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [showOrderForm, setShowOrderForm] = useState(false);

  const canManageInventory = user?.role === "inventory_manager" || 
                           user?.role === "tenant_admin" || 
                           user?.role === "property_manager";

  const handleOrderSubmit = (orderData: any) => {
    console.log("Order submitted:", orderData);
    setShowOrderForm(false);
    // Here you would typically submit to your API
  };

  const handleOrderCancel = () => {
    setShowOrderForm(false);
  };

  if (isMobile) {
    return <MobileInventory />;
  }

  if (showOrderForm) {
    return (
      <div className="container mx-auto p-6">
        <OrderForm 
          onSubmit={handleOrderSubmit}
          onCancel={handleOrderCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track stock levels, manage orders, and monitor usage
          </p>
        </div>
        
        {canManageInventory && (
          <Button 
            onClick={() => setShowOrderForm(true)} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value="add-item" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </TabsTrigger>
          <TabsTrigger value="receipt" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Receipt
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <StockLevels />
        </TabsContent>

        <TabsContent value="add-item" className="space-y-4">
          {canManageInventory ? (
            <AddItem />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Access Restricted</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You don't have permission to add inventory items.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          {canManageInventory ? (
            <StockReceipt />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Access Restricted</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You don't have permission to manage stock receipts.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          {canManageInventory ? (
            <StockTransfer />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Access Restricted</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You don't have permission to manage stock transfers.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <InventoryUsage />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            <OrderList />
            <VendorsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
