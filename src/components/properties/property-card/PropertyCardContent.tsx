
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

interface PropertyCardContentProps {
  property: UnifiedProperty;
}

export const PropertyCardContent = ({ property }: PropertyCardContentProps) => {
  return (
    <CardContent className="pb-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{property.type}</Badge>
        </div>
        <div className="font-medium">€{property.price}/night</div>
      </div>
    </CardContent>
  );
};
