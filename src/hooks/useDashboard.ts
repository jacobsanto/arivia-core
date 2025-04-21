import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toastService } from "@/services/toast";
import { fetchDashboardData, TaskRecord, DashboardData } from "@/utils/dashboard";
import { refreshDashboardData } from "@/utils/dashboard";
import { getDefaultDashboardData } from "@/utils/dashboardDataUtils";

// Maximum time to wait for data before showing fallback
const MAX_LOADING_TIME = 5000; // 5 seconds

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 7))
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Initialize as false
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Set a timeout to ensure we don't display loading state indefinitely
    const timeout = setTimeout(() => {
      // If we still don't have data after MAX_LOADING_TIME, use default data
      setDashboardData(prev => prev || getDefaultDashboardData());
      setIsLoading(false);
      setError("Data fetch timeout - showing default data");
    }, MAX_LOADING_TIME);

    setLoadingTimeout(timeout);

    try {
      const safeRange = {
        from: dateRange.from || new Date(),
        to: dateRange.to || new Date()
      };

      const data = await fetchDashboardData(selectedProperty, safeRange);

      if (loadingTimeout) clearTimeout(loadingTimeout);

      setDashboardData(data);
      setLastRefreshed(new Date());
      return data;
    } catch (err) {
      // Always set fallback data, so dashboardData is never null
      setDashboardData(getDefaultDashboardData());

      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      // Do not re-throw here!
      return null;
    } finally {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  }, [selectedProperty, dateRange, loadingTimeout]);

  useEffect(() => {
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loadingTimeout]);

  useEffect(() => {
    let isMounted = true;

    loadDashboardData().catch(err => {
      if (!isMounted) return;
      // We purposely do NOT want to throw or rethrow any error here, fallback already set
      console.error("Dashboard data load error:", err);
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
