
import { useState, useEffect } from 'react';
import { getDashboardData } from "@/utils/dashboardDataUtils";
import { subDays } from 'date-fns';

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  // Initialize date range with proper values - last 30 days by default
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
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
  
  const handleDateRangeChange = (newDateRange: any) => {
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
