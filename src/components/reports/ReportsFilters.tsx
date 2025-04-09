
import React from 'react';
import { Filter, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportsFiltersProps {
  dateRange: {from: Date | undefined, to: Date | undefined};
  setDateRange: (range: {from: Date | undefined, to: Date | undefined}) => void;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({ dateRange, setDateRange }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" /> Filters:
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-muted/50 text-nowrap">
          <Clock className="mr-1 h-3 w-3" /> Last 30 Days
        </Badge>
        <Badge variant="outline" className="bg-muted/50 text-nowrap">
          <Layers className="mr-1 h-3 w-3" /> All Properties
        </Badge>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-nowrap">
          + Add Filter
        </Button>
      </div>
      <div className="flex-grow w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
        <div className={`${isMobile ? 'w-full' : 'max-w-[300px]'}`}>
          <DateRangeSelector 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>
    </div>
  );
};
