
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MapPin } from "lucide-react";
import { UnifiedProperty } from "@/types/property.types";
import { unifiedPropertyService } from "@/services/property/unified-property.service";

interface UnifiedPropertyCardProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
}

const UnifiedPropertyCard = ({ 
  property,
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
}: UnifiedPropertyCardProps) => {
  const statusColors = {
    Occupied: "bg-green-100 text-green-800",
    Vacant: "bg-blue-100 text-blue-800",
    Maintenance: "bg-amber-100 text-amber-800",
  };

  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!property.guesty_id) return;
      
      const bookings = await unifiedPropertyService.getPropertyBookings(property.guesty_id);
      
      const today = new Date();
      const current = bookings.find(booking => 
        new Date(booking.check_in) <= today && 
        new Date(booking.check_out) >= today
      );
      setCurrentBooking(current || null);
      
      const upcoming = bookings
        .filter(booking => new Date(booking.check_in) > today)
        .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())[0];
      setNextBooking(upcoming || null);
    };
    
    fetchBookings();
  }, [property.id, property.guesty_id]);

  const renderBookingInfo = () => {
    if (currentBooking) {
      return (
        <div className="mt-2 pt-2 border-t text-xs">
          <p className="font-medium">Currently occupied by:</p>
          <p className="text-muted-foreground">{currentBooking.guest_name}</p>
          <p className="text-muted-foreground">Until {new Date(currentBooking.check_out).toLocaleDateString()}</p>
        </div>
      );
    }
    
    if (nextBooking) {
      return (
        <div className="mt-2 pt-2 border-t text-xs">
          <p className="font-medium">Next booking:</p>
          <p className="text-muted-foreground">{nextBooking.guest_name}</p>
          <p className="text-muted-foreground">From {new Date(nextBooking.check_in).toLocaleDateString()}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${statusColors[property.status as keyof typeof statusColors] || "bg-slate-100 text-slate-800"}`}>
          {property.status}
        </div>
        {property.source === 'guesty' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
            Guesty
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium line-clamp-1">{property.name}</h3>
            {property.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{property.address}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(property)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBookingManagement(property)}>Manage Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPricingConfig(property)}>Configure Pricing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGuestManagement(property)}>Guest Management</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{property.type}</Badge>
          </div>
          <div className="font-medium">€{property.price}/night</div>
        </div>
        
        {renderBookingInfo()}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>{property.bedrooms} Bedrooms</span>
          <span>{property.bathrooms} Bathrooms</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UnifiedPropertyCard;
