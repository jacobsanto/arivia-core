
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PropertySelectorProps {
  properties: string[];
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedProperty,
  onPropertyChange
}) => {
  // Use provided properties or default to just "all" if empty
  const propertiesList = properties.length > 0 
    ? properties
    : ["all"];

  return (
    <div className="space-y-1.5">
      <Label htmlFor="property-filter">Property</Label>
      <Select value={selectedProperty || "all"} onValueChange={onPropertyChange}>
        <SelectTrigger id="property-filter" className="w-[180px]">
          <SelectValue placeholder="Select Property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {propertiesList.filter(p => p !== 'all').map(property => (
            <SelectItem key={property} value={property}>
              {property.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
