
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useRealProperties } from "@/hooks/useRealProperties";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertySelectorProps {
  properties?: any[];
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  selectedProperty,
  onPropertyChange
}) => {
  const { properties, isLoading } = useRealProperties();

  if (isLoading) {
    return <Skeleton className="h-9 w-[200px]" />;
  }

  return (
    <Select value={selectedProperty} onValueChange={onPropertyChange}>
      <SelectTrigger className="w-[200px]">
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
  );
};
