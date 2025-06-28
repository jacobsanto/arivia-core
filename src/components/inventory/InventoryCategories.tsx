
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

const InventoryCategories = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Inventory Categories
        </CardTitle>
        <CardDescription>
          Organize your inventory into categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No categories found</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCategories;
