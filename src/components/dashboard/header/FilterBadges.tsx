
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import DateRangeDisplay from './DateRangeDisplay';

interface FilterBadgesProps {
  selectedProperty: string;
  dateRange: DateRange;
}

const FilterBadges: React.FC<FilterBadgesProps> = ({ 
  selectedProperty, 
  dateRange 
}) => {
  return (
    <div className="flex items-center mt-2 flex-wrap gap-2">
      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
        <Building className="mr-1 h-3 w-3" />
        {selectedProperty === "all" ? "All Properties" : selectedProperty}
      </Badge>
      <DateRangeDisplay dateRange={dateRange} />
    </div>
  );
};

export default FilterBadges;
