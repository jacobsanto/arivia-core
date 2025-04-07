import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeSelectorProps {
  onChange: (range: DateRange) => void;
  value?: DateRange;
  className?: string;
}

export const DateRangeSelector = ({ onChange, value, className }: DateRangeSelectorProps) => {
  const [date, setDate] = useState<DateRange>(value || { from: undefined, to: undefined });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  useEffect(() => {
    if (value && (value.from !== date.from || value.to !== date.to)) {
      setDate(value);
    }
  }, [value]);
  
  const handleSelect = (newDate: DateRange | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    
    if (newDate.from && newDate.to) {
      onChange(newDate);
      setIsCalendarOpen(false);
    } else if (newDate.from) {
      onChange({ ...newDate });
    }
  };
  
  const getDisplayText = () => {
    if (date.from && date.to) {
      return `${format(date.from, 'MMM d, yyyy')} - ${format(date.to, 'MMM d, yyyy')}`;
    }
    
    if (date.from) {
      return `${format(date.from, 'MMM d, yyyy')} - Select end date`;
    }
    
    return "Select date range";
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const emptyRange = { from: undefined, to: undefined };
    setDate(emptyRange);
    onChange(emptyRange);
  };

  return (
    <div className={className}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="font-medium">Date Range</h3>
            {(date.from || date.to) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
