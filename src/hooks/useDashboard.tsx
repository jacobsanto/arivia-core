
import { useState, useEffect, useCallback } from 'react';
import { getDashboardData } from "@/utils/dashboardDataUtils";
import { subDays } from 'date-fns';
import { toastService } from "@/services/toast";

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  // Initialize date range with proper values - last 30 days by default
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard data based on selected property and date range
      const data = getDashboardData(selectedProperty, dateRange);
      
      // Ensure the data has the required structure for metrics
      const formattedData = {
        ...data,
        properties: data.properties || { total: 0, occupied: 0, vacant: 0 },
        tasks: data.tasks || { total: 0, completed: 0, pending: 0 },
        maintenance: data.maintenance || { total: 0, critical: 0, standard: 0 }
      };
      
      setDashboardData(formattedData);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toastService.error("Failed to load dashboard data", {
        description: "Please try refreshing the page"
      });
    } finally {
      setIsLoading(false);
    }
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
  
  const refreshDashboard = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);
  
  return {
    selectedProperty,
    dateRange,
    dashboardData,
    isLoading,
    lastRefreshed,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard
  };
};
