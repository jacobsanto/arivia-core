import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Bed, 
  Bath, 
  MapPin, 
  Calendar, 
  Settings, 
  Eye,
  AlertCircle,
  CheckCircle,
  Wrench
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: string;
  num_bedrooms: number;
  num_bathrooms: number;
  description?: string;
  notes?: string;
}

interface PropertyCardProps {
  property: Property;
  onQuickAction?: (propertyId: string, action: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onQuickAction }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">
              {property.name}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(property.status)}
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(property.status)}`}
            >
              {property.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{property.address}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Details */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-1">
            <Bed className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{property.num_bedrooms} bed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{property.num_bathrooms} bath</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground capitalize">{property.property_type}</span>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">8</div>
            <div className="text-xs text-muted-foreground">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">95%</div>
            <div className="text-xs text-muted-foreground">Occupancy</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleViewDetails}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onQuickAction?.(property.id, 'manage')}
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};