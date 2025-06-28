
import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toastService } from "@/services/toast";
import { fetchDashboardData, TaskRecord, DashboardData } from "@/utils/dashboard";
import { refreshDashboardData } from "@/utils/dashboard";

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
      console.error('Dashboard data loading error:', err);
      
      // Set fallback data to prevent complete UI failure
      const fallbackData: DashboardData = {
        properties: { total: 0, occupied: 0, vacant: 0 },
        tasks: { total: 0, completed: 0, pending: 0 },
        maintenance: { total: 0, critical: 0, standard: 0 },
        upcomingTasks: [],
        housekeepingTasks: [],
        maintenanceTasks: [],
        quickStats: {
          occupancyRate: 0,
          avgRating: 0,
          revenueToday: 0,
          pendingCheckouts: 0
        }
      };
      setDashboardData(fallbackData);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty, dateRange]);

  useEffect(() => {
    let isMounted = true;
    
    loadDashboardData().catch(err => {
      if (!isMounted) return;
      console.error('Initial dashboard load failed:', err);
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
