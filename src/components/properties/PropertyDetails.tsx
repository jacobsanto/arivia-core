
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, Home, MessageSquare, User } from "lucide-react";
import { Property } from "@/types/property.types";
import BookingStatusContent from "./BookingStatusContent";

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetails = ({ property, onBack }: PropertyDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <h1 className="text-2xl font-bold">{property.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{property.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={property.status === "Occupied" ? "default" : property.status === "Vacant" ? "secondary" : "outline"}>
                  {property.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms:</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms:</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">€{property.price}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{property.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Guests:</span>
                <span className="font-medium">{property.max_guests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusContent property={property} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => onBack()}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Manage Bookings
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <DollarSign className="mr-2 h-4 w-4" />
                Configure Pricing
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <User className="mr-2 h-4 w-4" />
                Guest Management
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <Home className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyDetails;
