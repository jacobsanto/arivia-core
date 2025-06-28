
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const InventoryVendors = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Vendors
        </CardTitle>
        <CardDescription>
          Manage your suppliers and vendors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No vendors found</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryVendors;
