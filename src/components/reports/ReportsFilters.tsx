
import React from 'react';
import { Filter, Clock, Layers, RefreshCw, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { DateRangeSelector, DateRange } from '@/components/reports/DateRangeSelector';
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateRangeDisplay } from '@/utils/dateRangeUtils';
import { format } from 'date-fns';

interface ReportsFiltersProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({ dateRange, setDateRange }) => {
  const isMobile = useIsMobile();
  
  const handleRefresh = () => {
    console.log("Refreshing reports with date range:", dateRange);
    // In a real app, you would fetch new data here
  };
  
  const displayDateRange = () => {
    if (dateRange.from && dateRange.to) {
      if (isMobile) {
        return `${format(dateRange.from, 'MM/dd')} - ${format(dateRange.to, 'MM/dd')}`;
      }
      return formatDateRangeDisplay(dateRange.from, dateRange.to);
    }
    return "All Time";
  };
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" /> Filters:
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-muted/50 text-nowrap">
          <CalendarRange className="mr-1 h-3 w-3" /> {displayDateRange()}
        </Badge>
        <Badge variant="outline" className="bg-muted/50 text-nowrap">
          <Layers className="mr-1 h-3 w-3" /> All Properties
        </Badge>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-nowrap">
          + Add Filter
        </Button>
      </div>
      <div className="flex-grow w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
        <div className={`${isMobile ? 'w-full' : 'max-w-[300px]'} flex gap-2`}>
          <DateRangeSelector 
            value={dateRange}
            onChange={setDateRange}
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            className="h-10 w-10 flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
