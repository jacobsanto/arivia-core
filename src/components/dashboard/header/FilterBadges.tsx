
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DateRange } from "@/components/reports/DateRangeSelector";

interface FilterBadgesProps {
  selectedProperty: string;
  dateRange: DateRange;
}

const FilterBadges: React.FC<FilterBadgesProps> = ({ 
  selectedProperty, 
  dateRange 
}) => {
  return (
    <div className="flex items-center mt-2">
      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 mr-2">
        {selectedProperty === "all" ? "All Properties" : selectedProperty}
      </Badge>
      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
        {format(dateRange.from || new Date(), 'MMM d')} - {format(dateRange.to || new Date(), 'MMM d')}
      </Badge>
    </div>
  );
};

export default FilterBadges;
