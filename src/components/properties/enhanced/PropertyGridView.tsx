import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyListItem } from "@/types/property-detailed.types";
import { 
  MapPin, 
  Bed, 
  Bath, 
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyGridViewProps {
  properties: PropertyListItem[];
  onQuickAction?: (propertyId: string, action: string) => void;
}

export const PropertyGridView: React.FC<PropertyGridViewProps> = ({
  properties,
  onQuickAction
}) => {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'occupied': return 'default';
      case 'vacant': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoomStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'cleaned': return 'secondary';
      case 'cleaning': return 'outline';
      case 'inspected': return 'default';
      case 'dirty': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'cleaned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inspected': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dirty': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <Card 
          key={property.id}
          className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          {/* Hero Image */}
          <div className="relative h-48 bg-muted overflow-hidden">
            {property.hero_image ? (
              <img 
                src={property.hero_image} 
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-muted-foreground text-lg font-medium">
                  {property.name.charAt(0)}
                </div>
              </div>
            )}
            
            {/* Status Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge variant={getStatusBadgeVariant(property.status)} className="text-xs shadow-sm">
                {property.status}
              </Badge>
              <Badge 
                className={`text-xs shadow-sm border ${getRoomStatusColor(property.room_status)}`}
              >
                {property.room_status}
              </Badge>
            </div>

            {/* Issues Badge */}
            {property.open_issues_count > 0 && (
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={property.urgent_issues_count > 0 ? "destructive" : "secondary"}
                  className="text-xs shadow-sm"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {property.open_issues_count}
                </Badge>
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/properties/${property.id}`);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction?.(property.id, 'edit');
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction?.(property.id, 'assign_task');
                  }}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Assign Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground leading-tight">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Property Type */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="capitalize">
                  {property.property_type}
                </Badge>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.num_bedrooms} bed{property.num_bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.num_bathrooms} bath{property.num_bathrooms !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Issues Summary */}
              {property.open_issues_count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {property.open_issues_count} open issue{property.open_issues_count !== 1 ? 's' : ''}
                  {property.urgent_issues_count > 0 && (
                    <span className="text-destructive font-medium ml-1">
                      ({property.urgent_issues_count} urgent)
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {properties.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div className="space-y-3">
            <div className="text-lg font-medium text-muted-foreground">
              No properties found
            </div>
            <div className="text-sm text-muted-foreground">
              Try adjusting your filters to see more results.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};