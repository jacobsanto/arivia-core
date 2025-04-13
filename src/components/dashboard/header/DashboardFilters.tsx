
import React from 'react';
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import { DateRangeSelector, type DateRange } from "@/components/reports/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardFiltersProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedProperty,
  onPropertyChange,
  dateRange,
  onDateRangeChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
      <PropertyFilter
        selectedProperty={selectedProperty}
        onPropertyChange={onPropertyChange}
      />
      {!isMobile && (
        <DateRangeSelector 
          value={dateRange} 
          onChange={onDateRangeChange} 
        />
      )}
    </div>
  );
};

export default DashboardFilters;
