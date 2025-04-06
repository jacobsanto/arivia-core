
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyFilterProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  selectedProperty,
  onPropertyChange
}) => {
  return (
    <div className="w-full sm:w-64 space-y-2">
      <label className="text-sm font-medium">Filter by Property</label>
      <Select 
        value={selectedProperty} 
        onValueChange={onPropertyChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          <SelectItem value="Villa Caldera">Villa Caldera</SelectItem>
          <SelectItem value="Villa Sunset">Villa Sunset</SelectItem>
          <SelectItem value="Villa Oceana">Villa Oceana</SelectItem>
          <SelectItem value="Villa Paradiso">Villa Paradiso</SelectItem>
          <SelectItem value="Villa Azure">Villa Azure</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertyFilter;
