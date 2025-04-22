
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UnifiedProperty } from "@/types/property.types";
import { formatTimeAgo } from "@/services/dataFormatService";
import { format } from "date-fns";
import { Home, User, Ruler, MapPin } from "lucide-react";

interface PropertyCardContentProps {
  property: UnifiedProperty;
}

export const PropertyCardContent = ({ property }: PropertyCardContentProps) => {
  // Format for the next check-in badge
  const nextCheckInBadge = property.next_check_in ? (
    <Badge variant="outline" className="bg-slate-50 flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
      <span>Next check-in: {format(new Date(property.next_check_in), 'MMM d')}</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-slate-50 flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
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

  // Property type and capacity information
  const propertyTypeAndCapacity = (
    <div className="flex flex-wrap gap-4 mb-2">
      <div className="flex items-center gap-1 text-xs">
        <Home className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{property.type}</span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Sleeps {property.max_guests}</span>
      </div>
      {squareMeters}
    </div>
  );

  return (
    <div className="p-4 pt-2 space-y-3">
      {/* Location */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        <span className="line-clamp-1">{property.address}</span>
      </div>

      {/* Property Type, Capacity, and Area */}
      {propertyTypeAndCapacity}
      
      {/* Bedrooms and Bathrooms */}
      <div className="flex gap-4 mb-2">
        <div className="flex items-center gap-1 text-xs">
          <Bed className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Bath className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
        </div>
      </div>
      
      {/* Next Check-in Badge */}
      <div className="mt-2">
        {nextCheckInBadge}
      </div>
    </div>
  );
};
