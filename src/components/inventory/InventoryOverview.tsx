
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

const InventoryOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
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
            <div className="text-2xl font-bold text-amber-500">12</div>
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
            <div className="text-2xl font-bold text-destructive">3</div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-3">
                  <ArrowDownIcon className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Stock Receipt</p>
                    <p className="text-sm text-muted-foreground">Main Storage</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">15 items</p>
                  <p className="text-sm text-muted-foreground">2h ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-3">
                  <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Transfer</p>
                    <p className="text-sm text-muted-foreground">Main Storage → Villa Oceana</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">8 items</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-3">
                  <ArrowUpIcon className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-medium">Usage Recorded</p>
                    <p className="text-sm text-muted-foreground">Villa Caldera</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">12 items</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Items</AlertTitle>
              <AlertDescription>
                3 items are completely out of stock
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Hand Towels</p>
                  <p className="text-sm text-muted-foreground">Main Storage</p>
                </div>
                <Badge variant="outline" className="text-destructive border-destructive">
                  Out of Stock
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laundry Detergent</p>
                  <p className="text-sm text-muted-foreground">Main Storage</p>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  Low Stock (5)
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Toilet Paper</p>
                  <p className="text-sm text-muted-foreground">Villa Azure</p>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  Low Stock (3)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryOverview;
