
import { useState, useEffect, useCallback } from "react";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { toastService } from "@/services/toast";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";

export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    maintenance: number;
    available: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  upcomingTasks: Array<any>;
  housekeepingTasks: Array<any>;
  maintenanceTasks: Array<any>;
  quickStats: {
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

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, mock data with a delay to simulate API call
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            setDashboardData({
              properties: {
                total: 15,
                occupied: 9,
                maintenance: 2,
                available: 4
              },
              tasks: {
                total: 24,
                completed: 12,
                inProgress: 8,
                pending: 4
              },
              upcomingTasks: initialHousekeepingTasks.slice(0, 5),
              housekeepingTasks: initialHousekeepingTasks,
              maintenanceTasks: initialMaintenanceTasks,
              quickStats: {
                occupancyRate: 75,
                avgRating: 4.8,
                revenueToday: 2450,
                pendingCheckouts: 3
              }
            });
            setIsLoading(false);
            resolve();
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            setIsLoading(false);
            reject(new Error(errorMessage));
          }
        }, 1000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toastService.error("Dashboard data error", {
        description: errorMessage
      });
      setIsLoading(false);
      throw err;
    }
  }, [selectedProperty, dateRange]);

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

  const handlePropertyChange = useCallback((property: string) => {
    setSelectedProperty(property);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const refreshDashboard = useCallback(() => {
    return loadDashboardData();
  }, [loadDashboardData]);

  return {
    selectedProperty,
    dateRange,
    dashboardData,
    handlePropertyChange,
    handleDateRangeChange,
    refreshDashboard,
    isLoading,
    error
  };
};
