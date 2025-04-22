
import React, { useCallback, useState } from "react";
import { UnifiedProperty } from "@/types/property.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EllipsisVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PropertyCardMenuProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
}

// Ensures minimum 44x44 size and touch area
const menuTriggerClass = "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center p-0 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent transition";

// Mobile sheet content style
const mobileMenuContentClass = "w-full p-4 flex flex-col gap-2";

export const PropertyCardMenu = ({
  property,
  onViewDetails,
}: PropertyCardMenuProps) => {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleViewDetails = useCallback(() => {
    onViewDetails(property);
    if (isMobile) setSheetOpen(false);
  }, [onViewDetails, property, isMobile]);

  if (isMobile) {
    // Render as bottom sheet with single action
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className={menuTriggerClass + " touch-feedback"}
            aria-label="Open property menu"
          >
            <EllipsisVertical className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className={mobileMenuContentClass + " border-none"}
          swipeEnabled={true}
          swipeThreshold={70}
        >
          <SheetHeader>
            <div className="w-12 h-1.5 mx-auto bg-muted-foreground/40 rounded-full mb-2 mt-1" />
            <span className="text-base font-semibold text-center">Actions</span>
          </SheetHeader>
          <Button
            variant="outline"
            className="text-base w-full py-3 my-2 rounded-lg"
            onClick={handleViewDetails}
            style={{ minHeight: 44, fontSize: 18 }}
          >
            View Details
          </Button>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: keep as dropdown with only 'View Details', proper min size
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={menuTriggerClass}
          aria-label="Open property menu"
        >
          <EllipsisVertical className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-background">
        <DropdownMenuItem
          onClick={() => onViewDetails(property)}
          className="text-base min-h-[44px] flex items-center"
        >
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
