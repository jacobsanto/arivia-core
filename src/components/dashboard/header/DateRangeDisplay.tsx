
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { formatDateRange } from '@/utils/dateRangeUtils';
import { Calendar } from "lucide-react";

interface DateRangeDisplayProps {
  dateRange: DateRange;
  className?: string;
}

const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({ 
  dateRange,
  className = ""
}) => {
  const displayText = () => {
    if (dateRange.from && dateRange.to) {
      return formatDateRange(dateRange.from, dateRange.to);
    }
    return "All time";
  };
  
  return (
    <Badge variant="outline" className={`bg-blue-50 text-blue-800 border-blue-200 flex items-center ${className}`}>
      <Calendar className="mr-1 h-3 w-3" />
      {displayText()}
    </Badge>
  );
};

export default DateRangeDisplay;
