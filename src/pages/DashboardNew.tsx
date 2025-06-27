
import React, { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { useUser } from "@/contexts/UserContext";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";

const DashboardNew: React.FC = () => {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  }, []);

  const validDateRange = dateRange.from && dateRange.to ? {
    from: dateRange.from,
    to: dateRange.to
  } : {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  };

  return (
    <DashboardDataProvider>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        <DashboardContent 
          dateRange={validDateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
    </DashboardDataProvider>
  );
};

export default DashboardNew;
