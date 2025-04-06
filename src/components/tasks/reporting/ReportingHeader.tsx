
import React from "react";
import { Button } from "@/components/ui/button";

interface ReportingHeaderProps {
  dateRange: string;
  setDateRange: (range: string) => void;
}

export const ReportingHeader = ({ dateRange, setDateRange }: ReportingHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <p className="text-muted-foreground">
        View historical data on housekeeping tasks and staff performance.
      </p>
      <div className="flex space-x-2">
        <Button
          variant={dateRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("week")}
        >
          Week
        </Button>
        <Button
          variant={dateRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("month")}
        >
          Month
        </Button>
        <Button
          variant={dateRange === "quarter" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("quarter")}
        >
          Quarter
        </Button>
        <Button
          variant={dateRange === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("year")}
        >
          Year
        </Button>
        <Button
          variant={dateRange === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("custom")}
        >
          Custom
        </Button>
      </div>
    </div>
  );
};
