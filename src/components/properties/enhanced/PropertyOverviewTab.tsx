import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetailedProperty, ALL_AMENITIES, AMENITY_CATEGORIES } from "@/types/property-detailed.types";
import { AmenitiesEditModal } from "./AmenitiesEditModal";
import { 
  Edit,
  Bed,
  Bath,
  Users,
  Home,
  Wifi,
  Car,
  Waves,
  ChefHat,
  Tv,
  Shield
} from "lucide-react";

interface PropertyOverviewTabProps {
  property: DetailedProperty;
}

// Icon mapping for amenities
const getAmenityIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Wifi': return Wifi;
    case 'Car': return Car;
    case 'Waves': return Waves;
    case 'ChefHat': return ChefHat;
    case 'Tv': return Tv;
    case 'Shield': return Shield;
    case 'Home': return Home;
    default: return Shield;
  }
};

export const PropertyOverviewTab: React.FC<PropertyOverviewTabProps> = ({
  property
}) => {
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);

  // Group amenities by category
  const amenitiesByCategory = AMENITY_CATEGORIES.map(category => ({
    ...category,
    amenities: property.amenities.filter(amenity => amenity.category === category.id)
  })).filter(category => category.amenities.length > 0);

  return (
    <div className="space-y-6">
      {/* Property Description */}
      <Card>
        <CardHeader>
          <CardTitle>Property Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {property.description || "No description available for this property."}
          </p>
        </CardContent>
      </Card>

      {/* Key Information */}
      <Card>
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{property.num_bedrooms}</div>
                <div className="text-sm text-muted-foreground">Bedroom{property.num_bedrooms !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bath className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{property.num_bathrooms}</div>
                <div className="text-sm text-muted-foreground">Bathroom{property.num_bathrooms !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{property.max_guests}</div>
                <div className="text-sm text-muted-foreground">Max Guests</div>
              </div>
            </div>

            {property.square_feet && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{property.square_feet}</div>
                  <div className="text-sm text-muted-foreground">Sq Ft</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Amenities</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAmenitiesModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Amenities
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {amenitiesByCategory.length > 0 ? (
            <div className="space-y-6">
              {amenitiesByCategory.map((category) => (
                <div key={category.id}>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    {category.name}
                    <Badge variant="secondary" className="text-xs">
                      {category.amenities.length}
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.amenities.map((amenity) => {
                      const IconComponent = getAmenityIcon(amenity.icon);
                      return (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {amenity.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No amenities configured
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Add amenities to showcase what this property offers to guests.
              </div>
              <Button 
                variant="outline"
                onClick={() => setIsAmenitiesModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Amenities
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-medium text-foreground mb-1">Property Type</div>
              <div className="text-muted-foreground capitalize">{property.property_type}</div>
            </div>
            
            <div>
              <div className="font-medium text-foreground mb-1">Current Status</div>
              <div className="text-muted-foreground capitalize">{property.status}</div>
            </div>
            
            {property.last_occupied && (
              <div>
                <div className="font-medium text-foreground mb-1">Last Occupied</div>
                <div className="text-muted-foreground">
                  {new Date(property.last_occupied).toLocaleDateString()}
                </div>
              </div>
            )}
            
            {property.next_checkin && (
              <div>
                <div className="font-medium text-foreground mb-1">Next Check-in</div>
                <div className="text-muted-foreground">
                  {new Date(property.next_checkin).toLocaleDateString()}
                </div>
              </div>
            )}
            
            <div>
              <div className="font-medium text-foreground mb-1">Created</div>
              <div className="text-muted-foreground">
                {new Date(property.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-foreground mb-1">Last Updated</div>
              <div className="text-muted-foreground">
                {new Date(property.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AmenitiesEditModal
        isOpen={isAmenitiesModalOpen}
        onOpenChange={setIsAmenitiesModalOpen}
        propertyId={property.id}
        currentAmenities={property.amenities}
      />
    </div>
  );
};