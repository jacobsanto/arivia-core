
import { useState, useEffect } from 'react';
import { getDashboardData } from "@/utils/dashboardDataUtils";
import { type DateRange } from "@/components/reports/DateRangeSelector";

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  useEffect(() => {
    // Fetch dashboard data based on selected property and date range
    const data = getDashboardData(selectedProperty, dateRange);
    setDashboardData(data);
  }, [selectedProperty, dateRange]);
  
  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
  };
  
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };
  
  return {
    selectedProperty,
    dateRange,
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange
  };
};
