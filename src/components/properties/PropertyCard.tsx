
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, Users } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { assignmentService, type AssignableUser } from "@/services/property/assignment.service";
import type { Property } from "@/types/property.types";

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onBookingManagement: (property: Property) => void;
  onPricingConfig: (property: Property) => void;
  onGuestManagement: (property: Property) => void;
  onDelete: (id: string, name: string) => void;
  onManageAssignments?: (property: Property) => void;
}

const PropertyCard = ({ 
  property, 
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
  onDelete,
  onManageAssignments
}: PropertyCardProps) => {
  const statusColors = {
    Occupied: "bg-green-100 text-green-800",
    Vacant: "bg-blue-100 text-blue-800",
    Maintenance: "bg-amber-100 text-amber-800",
  };

  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [assignedUsers, setAssignedUsers] = useState<AssignableUser[]>([]);
  const { getPropertyBookings } = useProperties();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch bookings
      const bookings = await getPropertyBookings(property.id);
      
      const today = new Date();
      const current = bookings.find(booking => 
        new Date(booking.check_in_date) <= today && 
        new Date(booking.check_out_date) >= today
      );
      setCurrentBooking(current || null);
      
      const upcoming = bookings
        .filter(booking => new Date(booking.check_in_date) > today)
        .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
      setNextBooking(upcoming || null);

      // Fetch assigned users
      if (property.assigned_users && property.assigned_users.length > 0) {
        try {
          const users = await assignmentService.getAssignableUsers();
          const assigned = users.filter(user => property.assigned_users?.includes(user.id));
          setAssignedUsers(assigned);
        } catch (error) {
          console.error('Error fetching assigned users:', error);
        }
      }
    };
    
    fetchData();
  }, [property.id, property.assigned_users]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${statusColors[property.status as keyof typeof statusColors]}`}>
          {property.status}
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{property.name}</CardTitle>
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
              {onManageAssignments && (
                <DropdownMenuItem onClick={() => onManageAssignments(property)}>
                  Manage Staff Assignments
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(property.id, property.name)}>
                Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{property.location}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{property.type}</Badge>
          </div>
          <div className="font-medium">€{property.price}/night</div>
        </div>
        
        {currentBooking && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Currently occupied by:</p>
            <p className="text-muted-foreground">{currentBooking.guest_name}</p>
            <p className="text-muted-foreground">Until {new Date(currentBooking.check_out_date).toLocaleDateString()}</p>
          </div>
        )}
        
        {!currentBooking && nextBooking && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Next booking:</p>
            <p className="text-muted-foreground">{nextBooking.guest_name}</p>
            <p className="text-muted-foreground">From {new Date(nextBooking.check_in_date).toLocaleDateString()}</p>
          </div>
        )}

        {/* Assigned Staff */}
        {assignedUsers.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Assigned Staff</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {assignedUsers.slice(0, 3).map((user) => (
                <Badge key={user.id} variant="outline" className="text-xs">
                  {user.name}
                </Badge>
              ))}
              {assignedUsers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{assignedUsers.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
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

export default PropertyCard;
