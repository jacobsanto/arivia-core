
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UnifiedProperty } from "@/types/property.types";
import { formatTimeAgo } from "@/services/dataFormatService";
import { format } from "date-fns";
import { Broom as BroomIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyCardContentProps {
  property: UnifiedProperty;
}

export const PropertyCardContent = ({ property }: PropertyCardContentProps) => {
  const nextCheckInBadge = property.next_check_in ? (
    <Badge variant="outline" className="bg-green-50">
      Next Check-in: {format(new Date(property.next_check_in), 'MMM d')}
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-50">
      No upcoming stays
    </Badge>
  );

  return (
    <div className="p-4 pt-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{property.type}</Badge>
          {property.has_active_cleaning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-yellow-600">
                    <BroomIcon className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cleaning task scheduled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {property.last_synced && (
            <span className="text-xs text-muted-foreground">
              Last sync: {formatTimeAgo(property.last_synced)}
            </span>
          )}
        </div>
        <div className="font-medium">€{property.price}/night</div>
      </div>
      <div className="mt-2">
        {nextCheckInBadge}
      </div>
    </div>
  );
};
