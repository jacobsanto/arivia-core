
import React from 'react';
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealProperties } from "@/hooks/useRealProperties";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyFilterProps {
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  selectedProperty,
  onPropertyChange
}) => {
  const isMobile = useIsMobile();
  const { properties, isLoading } = useRealProperties();

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {!isMobile && <Label>Property</Label>}
        <Skeleton className={`w-full ${isMobile ? "h-10" : "h-9"}`} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {!isMobile && <Label htmlFor="property-filter">Property</Label>}
      <Select value={selectedProperty} onValueChange={onPropertyChange}>
        <SelectTrigger className={isMobile ? "h-10" : ""} id="property-filter">
          <SelectValue placeholder="Select Property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {Array.isArray(properties) && properties.map(property => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertyFilter;
