
import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const fetchDashboardData = useCallback(() => {
    setIsLoading(true);
    // Fetch dashboard data based on selected property and date range
    const data = getDashboardData(selectedProperty, dateRange);
    setDashboardData(data);
    setIsLoading(false);
  }, [selectedProperty, dateRange]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
  };
  
  const handleDateRangeChange = (newDateRange: any) => {
    setDateRange(newDateRange);
  };
  
  const refreshDashboard = () => {
    fetchDashboardData();
  };
  
  return {
    selectedProperty,
    dateRange,
    dashboardData,
    isLoading,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard
  };
};
