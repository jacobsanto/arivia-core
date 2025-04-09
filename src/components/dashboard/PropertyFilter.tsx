
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

interface PropertyFilterProps {
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  selectedProperty,
  onPropertyChange
}) => {
  const isMobile = useIsMobile();
  
  const properties = [
    { id: "all", name: "All Properties" },
    { id: "villa-caldera", name: "Villa Caldera" },
    { id: "villa-azure", name: "Villa Azure" },
    { id: "villa-sunset", name: "Villa Sunset" },
    { id: "villa-oceana", name: "Villa Oceana" },
    { id: "villa-paradiso", name: "Villa Paradiso" },
  ];

  return (
    <div className="space-y-1.5">
      {!isMobile && <Label htmlFor="property-filter">Property</Label>}
      <Select value={selectedProperty} onValueChange={onPropertyChange}>
        <SelectTrigger className={isMobile ? "h-10" : ""} id="property-filter">
          <SelectValue placeholder="Select Property" />
        </SelectTrigger>
        <SelectContent>
          {properties.map(property => (
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
