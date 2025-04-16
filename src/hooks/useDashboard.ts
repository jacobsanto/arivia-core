
import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toastService } from "@/services/toast";
import { fetchDashboardData } from "@/utils/dashboard/dataFetchUtils";
import { refreshDashboardData } from "@/utils/dashboard";

export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance?: number;
    available?: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress?: number;
  };
  maintenance: {
    total: number;
    critical: number;
    standard: number;
  };
  upcomingTasks?: Array<Record<string, any>>;
  housekeepingTasks?: Array<Record<string, any>>;
  maintenanceTasks?: Array<Record<string, any>>;
  quickStats?: {
    occupancyRate: number;
    avgRating: number;
    revenueToday: number;
    pendingCheckouts: number;
  };
}

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 7))
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load dashboard data function
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchDashboardData(selectedProperty, dateRange);
      setDashboardData(data);
      setLastRefreshed(new Date());
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty, dateRange]);

  // Effect to load data when dependencies change
  useEffect(() => {
    let isMounted = true;
    
    // Only update state if component is still mounted
    loadDashboardData().catch(err => {
      // Handle error but prevent state updates if unmounted
      if (!isMounted) return;
      // Error already handled in loadDashboardData
    });
    
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  // Handler for property selection change
  const handlePropertyChange = useCallback((property: string) => {
    setSelectedProperty(property);
  }, []);

  // Handler for date range change
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    return refreshDashboardData(loadDashboardData);
  }, [loadDashboardData]);

  return {
    selectedProperty,
    dateRange,
    dashboardData,
    lastRefreshed,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error
  };
};
