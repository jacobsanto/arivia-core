
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateRange as DayPickerDateRange } from "react-day-picker";

// Use our own DateRange interface with optional properties that works with our application
export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const isMobile = useIsMobile();

  const formattedValue = () => {
    if (value.from && value.to) {
      if (isMobile) {
        return `${format(value.from, 'MM/dd')} - ${format(value.to, 'MM/dd')}`;
      }
      return `${format(value.from, 'PPP')} - ${format(value.to, 'PPP')}`;
    }
    if (value.from) {
      return isMobile ? format(value.from, 'MM/dd') : format(value.from, 'PPP');
    }
    return "Select date";
  };

  // Convert our DateRange to the react-day-picker's DateRange when needed
  const toRdpDateRange = (range: DateRange): DayPickerDateRange | undefined => {
    // If from is undefined, return undefined as that's what DayPicker expects for an unselected range
    if (!range.from) return undefined;
    
    return {
      from: range.from,
      to: range.to
    };
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal overflow-hidden", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formattedValue()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom">
        <Calendar 
          mode="range" 
          selected={toRdpDateRange(value)} 
          onSelect={range => {
            onChange(range || { from: undefined, to: undefined });
          }} 
          numberOfMonths={isMobile ? 1 : 2} 
          initialFocus 
          className="pointer-events-auto" 
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeSelector;
