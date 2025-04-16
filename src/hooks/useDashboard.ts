
import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toastService } from "@/services/toast";
import { fetchDashboardData, TaskRecord } from "@/utils/dashboard/dataFetchUtils";
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
  upcomingTasks?: TaskRecord[];
  housekeepingTasks?: TaskRecord[];
  maintenanceTasks?: TaskRecord[];
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

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const safeRange = {
        from: dateRange.from || new Date(),
        to: dateRange.to || new Date()
      };
      
      const data = await fetchDashboardData(selectedProperty, safeRange);
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

  useEffect(() => {
    let isMounted = true;
    
    loadDashboardData().catch(err => {
      if (!isMounted) return;
    });
    
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const handlePropertyChange = useCallback((property: string) => {
    setSelectedProperty(property);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

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
