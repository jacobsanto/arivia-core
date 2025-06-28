
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const InventoryItems = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Items
        </CardTitle>
        <CardDescription>
          Manage your inventory items and stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No inventory items found</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryItems;
