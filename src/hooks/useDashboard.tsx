
import { useState, useEffect, useCallback } from 'react';
import { getDashboardData } from "@/utils/dashboardDataUtils";
import { subDays } from 'date-fns';
import { toastService } from "@/services/toast/toast.service";

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
      // Fetch dashboard data based on selected property
      const data = getDashboardData(selectedProperty);
      setDashboardData(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toastService.error("Failed to load dashboard data", {
        description: "Please try refreshing the page"
      });
      // Set default data structure even on error to prevent null reference issues
      setDashboardData({
        properties: { total: 0, occupied: 0, vacant: 0 },
        tasks: { total: 0, completed: 0, pending: 0 },
        maintenance: { total: 0, critical: 0, standard: 0 },
        bookings: [],
        upcomingTasks: []
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty]);
  
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
