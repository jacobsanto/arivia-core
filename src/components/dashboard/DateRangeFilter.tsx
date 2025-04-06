
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  date,
  onDateChange
}) => {
  return (
    <div className="w-full sm:w-64 space-y-2">
      <label className="text-sm font-medium">Filter by Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
            className={cn("rounded-md border")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
