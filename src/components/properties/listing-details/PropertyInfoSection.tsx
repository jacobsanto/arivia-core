
import React from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  HomeIcon, 
  Users, 
  Ruler, 
  Edit
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertyInfoSectionProps {
  listing: any;
}

const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({ listing }) => {
  const isMobile = useIsMobile();
  
  // Extract raw data if available
  const rawData = listing.raw_data || {};
  
  // Extract address from the listing
  const addressObj = typeof listing.address === 'string' 
    ? JSON.parse(listing.address) 
    : listing.address;
    
  const fullAddress = addressObj && typeof addressObj === 'object' && addressObj.full 
    ? addressObj.full 
    : 'No address provided';
  
  // Extract property details
  const bedrooms = rawData.bedrooms || 0;
  const bathrooms = rawData.bathrooms || 0;
  const squareMeters = rawData.area?.areaSquareMeters || 'N/A';
  const guestCapacity = rawData.accommodates || 0;

  // Get the main image URL - high res if available or thumbnail
  const mainImageUrl = listing.highres_url || listing.thumbnail_url || '/placeholder.svg';

  return (
    <div className="space-y-6">
      {/* Property Image Gallery - For now, just the main image */}
      <div className="relative">
        <div className="aspect-[16/9] overflow-hidden rounded-lg">
          <img
            src={mainImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <Button 
          className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
          size="sm"
          variant="outline"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Photos
        </Button>
      </div>

      {/* Property Info Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <HomeIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {listing.property_type || 'Property'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-lg font-medium">{bedrooms}</span>
                <span className="text-sm text-muted-foreground ml-1">bed</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-medium">{bathrooms}</span>
                <span className="text-sm text-muted-foreground ml-1">bath</span>
              </div>
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-1" />
                <span className="text-lg font-medium">{squareMeters}</span>
                <span className="text-sm text-muted-foreground ml-1">m²</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-lg font-medium">{guestCapacity}</span>
                <span className="text-sm text-muted-foreground ml-1">guests</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
            <p className="text-base">{fullAddress}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
            <Badge
              variant={listing.status === 'active' ? 'default' : 'outline'}
              className="text-sm"
            >
              {listing.status || 'Unknown'}
            </Badge>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            
            <Button variant="ghost">
              View on Guesty
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyInfoSection;
