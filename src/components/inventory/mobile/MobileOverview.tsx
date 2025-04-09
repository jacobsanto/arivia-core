
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MobileOverview = () => {
  // Mock data
  const lowStockItems = [
    { id: 1, name: "Bathroom Towels", location: "Main Storage", currentStock: 5, minStock: 10 },
    { id: 2, name: "Toilet Paper", location: "Villa Caldera", currentStock: 2, minStock: 5 },
    { id: 3, name: "Dishwasher Tablets", location: "Villa Azure", currentStock: 3, minStock: 8 }
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Package className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">126</div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <CircleDollarSign className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">€1,480</div>
              <div className="text-xs text-muted-foreground">Inventory Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {lowStockItems.map(item => (
              <div key={item.id} className="pb-2 border-b last:border-b-0 last:pb-0">
                <div className="flex justify-between mb-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <Badge variant="outline" className="text-xs">{item.location}</Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <span>{item.currentStock}/{item.minStock} units</span>
                </div>
                <Progress value={(item.currentStock / item.minStock) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            View All Low Stock Items
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center py-2 border-b last:border-b-0">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm">Coffee Pods Received</div>
                  <div className="text-xs text-muted-foreground">Added 3 hours ago</div>
                </div>
                <Badge className="ml-auto">+24 units</Badge>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOverview;
