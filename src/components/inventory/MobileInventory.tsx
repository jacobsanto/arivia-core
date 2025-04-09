
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Package, Plus, Tag, ArrowDownUp, ArrowRight, Truck, Filter } from "lucide-react";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { OrderProvider } from "@/contexts/OrderContext";
import MobileStockLevels from "./mobile/MobileStockLevels";
import MobileAddItem from "./mobile/MobileAddItem";
import MobileStockReceipt from "./mobile/MobileStockReceipt";
import MobileStockTransfer from "./mobile/MobileStockTransfer";
import MobileOverview from "./mobile/MobileOverview";

const MobileInventory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<string | null>(null);

  const openSheet = (content: string) => {
    setSheetContent(content);
    setIsSheetOpen(true);
  };

  const sheetTitles: Record<string, string> = {
    "add-item": "Add New Item",
    "receipts": "Record Stock Receipt",
    "transfers": "Transfer Stock",
    "vendors": "Vendors",
    "orders": "Orders",
    "create-order": "Create Order"
  };

  return (
    <InventoryProvider>
      <OrderProvider>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Inventory</h1>
            <p className="text-muted-foreground">
              Manage supplies across locations
            </p>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 mobile-scroll">
            <Button 
              size="sm" 
              variant={activeTab === "overview" ? "default" : "outline"} 
              onClick={() => setActiveTab("overview")}
              className="flex-shrink-0"
            >
              <Package className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button 
              size="sm" 
              variant={activeTab === "stock-levels" ? "default" : "outline"} 
              onClick={() => setActiveTab("stock-levels")}
              className="flex-shrink-0"
            >
              <Tag className="mr-2 h-4 w-4" />
              Stock
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openSheet("add-item")}
              className="flex-shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openSheet("receipts")}
              className="flex-shrink-0"
            >
              <ArrowDownUp className="mr-2 h-4 w-4" />
              Receipt
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openSheet("transfers")}
              className="flex-shrink-0"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openSheet("create-order")}
              className="flex-shrink-0"
            >
              <Truck className="mr-2 h-4 w-4" />
              Order
            </Button>
          </div>
          
          <div className="pb-16">
            {activeTab === "overview" && <MobileOverview />}
            {activeTab === "stock-levels" && <MobileStockLevels />}
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="h-[85vh] pt-6">
              <SheetHeader>
                <SheetTitle>{sheetContent ? sheetTitles[sheetContent] : ""}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto h-[calc(100%-4rem)]">
                {sheetContent === "add-item" && <MobileAddItem onComplete={() => setIsSheetOpen(false)} />}
                {sheetContent === "receipts" && <MobileStockReceipt onComplete={() => setIsSheetOpen(false)} />}
                {sheetContent === "transfers" && <MobileStockTransfer onComplete={() => setIsSheetOpen(false)} />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </OrderProvider>
    </InventoryProvider>
  );
};

export default MobileInventory;
