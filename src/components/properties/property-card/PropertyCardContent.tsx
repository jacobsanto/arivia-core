
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UnifiedProperty } from "@/types/property.types";
import { formatTimeAgo } from "@/services/dataFormatService";
import { format } from "date-fns";
import { Brush, Calendar, User, Ruler } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyCardContentProps {
  property: UnifiedProperty;
}

export const PropertyCardContent = ({ property }: PropertyCardContentProps) => {
  // Format for the next check-in badge
  const nextCheckInBadge = property.next_check_in ? (
    <Badge variant="outline" className="bg-green-50 flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5" />
      <span>Next check-in: {format(new Date(property.next_check_in), 'MMM d')}</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-50 flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5" />
      <span>No upcoming stays</span>
    </Badge>
  );

  // Extract area from raw_data if available
  const squareMeters = property.raw_data?.area ? (
    <div className="flex items-center gap-1 text-xs">
      <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{property.raw_data.area} m²</span>
    </div>
  ) : null;

  // Guest capacity information
  const guestCapacity = (
    <div className="flex items-center gap-1 text-xs">
      <User className="h-3.5 w-3.5 text-muted-foreground" />
      <span>Sleeps {property.max_guests}</span>
    </div>
  );

  return (
    <div className="p-4 pt-2">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{property.type}</Badge>
          {property.has_active_cleaning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-yellow-600">
                    <Brush className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cleaning task scheduled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="font-medium">€{property.price}/night</div>
      </div>
      
      <div className="flex flex-col gap-2 mt-3">
        <div className="flex flex-wrap gap-2 mb-1">
          {guestCapacity}
          {squareMeters}
        </div>
        
        <div className="mt-1">
          {nextCheckInBadge}
        </div>
      </div>
    </div>
  );
};
