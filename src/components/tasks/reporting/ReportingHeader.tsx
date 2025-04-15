
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Loader2 } from "lucide-react";
import { getDateRangeDescription } from "@/utils/dateRangeUtils";

interface ReportingHeaderProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  isLoading?: boolean;
}

export const ReportingHeader = ({
  dateRange,
  setDateRange,
  isLoading = false
}: ReportingHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex items-center">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        <span className="font-medium flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {dateRange === "custom" ? "Custom Period" : getDateRangeDescription(dateRange)}
        </span>
      </div>
      
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={dateRange === "week" ? "default" : "outline"} size="sm" onClick={() => setDateRange("week")}>
                Week
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current week</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={dateRange === "month" ? "default" : "outline"} size="sm" onClick={() => setDateRange("month")}>
                Month
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current month</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={dateRange === "quarter" ? "default" : "outline"} size="sm" onClick={() => setDateRange("quarter")}>
                Quarter
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current quarter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={dateRange === "year" ? "default" : "outline"} size="sm" onClick={() => setDateRange("year")}>
                Year
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current year</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={dateRange === "custom" ? "default" : "outline"} size="sm" onClick={() => setDateRange("custom")}>
                Custom
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select custom date range</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
