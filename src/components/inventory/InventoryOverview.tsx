
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const InventoryOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below minimum level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items requiring immediate restock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 7 days inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertTitle>No recent activity</AlertTitle>
              <AlertDescription>
                No inventory movements have been recorded recently. Start adding inventory transactions to see them here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertTitle>No alerts</AlertTitle>
              <AlertDescription>
                No items are currently below their minimum stock levels.
              </AlertDescription>
            </Alert>

            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/inventory?tab=add-item')}
              >
                Add Inventory Items
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryOverview;
