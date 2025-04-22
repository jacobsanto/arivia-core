
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyCardMenuProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
}

export const PropertyCardMenu = ({
  property,
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
}: PropertyCardMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(property)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBookingManagement(property)}>
          Manage Bookings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPricingConfig(property)}>
          Configure Pricing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onGuestManagement(property)}>
          Guest Management
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
