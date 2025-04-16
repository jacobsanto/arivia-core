
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeSelector, DateRange } from '@/components/reports/DateRangeSelector';
import { Button } from '@/components/ui/button';
import { Calendar, Building, Filter, X, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { PropertyFilter, TimeRangeFilter, useAnalytics } from '@/contexts/AnalyticsContext';
import { format } from 'date-fns';
import { formatDateRange, getDateRangeDescription } from '@/utils/dateRangeUtils';

export const AnalyticsFilters: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    selectedProperty,
    setSelectedProperty,
    selectedYear,
    setSelectedYear,
    dateRange,
    setDateRange,
    timeRangeFilter,
    setTimeRangeFilter,
    isLoading,
    refreshData
  } = useAnalytics();
  
  const propertyOptions: {
    value: PropertyFilter;
    label: string;
  }[] = [{
    value: 'all',
    label: 'All Properties'
  }, {
    value: 'Villa Caldera',
    label: 'Villa Caldera'
  }, {
    value: 'Villa Sunset',
    label: 'Villa Sunset'
  }, {
    value: 'Villa Oceana',
    label: 'Villa Oceana'
  }, {
    value: 'Villa Paradiso',
    label: 'Villa Paradiso'
  }, {
    value: 'Villa Azure',
    label: 'Villa Azure'
  }];
  
  const yearOptions = ['2024', '2025', '2026'];
  
  const timeRangeOptions: {
    value: TimeRangeFilter;
    label: string;
  }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'last12months', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  const handleClearFilters = () => {
    setSelectedProperty('all');
    setSelectedYear('2025');
    setTimeRangeFilter('month');
  };

  const handleCustomDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range.from && range.to) {
      setTimeRangeFilter('custom');
    }
  };

  const displayDateRange = () => {
    if (timeRangeFilter === 'custom' && dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    return getDateRangeDescription(timeRangeFilter);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" /> Filters:
        </div>
        
        {selectedProperty !== 'all' && (
          <Badge variant="outline" className="bg-muted/50 text-nowrap">
            <Building className="mr-1 h-3 w-3" />
            {selectedProperty}
            <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSelectedProperty('all')} />
          </Badge>
        )}
        
        <Badge variant="outline" className="text-nowrap rounded-none bg-zinc-50">
          <Calendar className="mr-1 h-3 w-3" />
          {displayDateRange()}
        </Badge>

        <div className="flex gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData} 
            disabled={isLoading}
            className="text-xs h-7 text-nowrap"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters} 
            className="text-xs h-7 text-nowrap text-justify mx-0 font-thin bg-zinc-50 rounded px-[7px]"
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Select 
          value={selectedProperty} 
          onValueChange={value => setSelectedProperty(value as PropertyFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Property" />
          </SelectTrigger>
          <SelectContent>
            {propertyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={timeRangeFilter} 
          onValueChange={value => setTimeRangeFilter(value as TimeRangeFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-grow">
          <DateRangeSelector 
            value={dateRange} 
            onChange={handleCustomDateRangeChange}
          />
        </div>
      </div>
    </div>
  );
};
