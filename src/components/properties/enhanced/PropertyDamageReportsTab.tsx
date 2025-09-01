import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyDamageReportsTabProps {
  propertyId: string;
}

export const PropertyDamageReportsTab: React.FC<PropertyDamageReportsTabProps> = ({ propertyId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-medium mb-2">No Damage Reports</h3>
          <p className="text-muted-foreground">All damage reports for this property will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};