
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UnifiedProperty } from "@/types/property.types";
import { formatTimeAgo } from "@/services/dataFormatService";

interface PropertyCardContentProps {
  property: UnifiedProperty;
}

export const PropertyCardContent = ({ property }: PropertyCardContentProps) => {
  return (
    <div className="p-4 pt-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{property.type}</Badge>
          {property.last_synced && (
            <span className="text-xs text-muted-foreground">
              Last sync: {formatTimeAgo(property.last_synced)}
            </span>
          )}
        </div>
        <div className="font-medium">€{property.price}/night</div>
      </div>
    </div>
  );
};
