
import React from "react";

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
      <div className="space-x-2">
        <select 
          className="border rounded p-1 text-sm"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>
  );
};
