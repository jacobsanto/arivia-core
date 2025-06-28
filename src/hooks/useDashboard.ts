
import { useState, useEffect } from 'react';
import { Task } from '@/services/task-management/task.service';
import { useTaskManagement } from './useTaskManagement';
import { 
  refreshDashboardData, 
  setupAutoRefresh, 
  getRefreshStatus,
  mockBookingData,
  mockTaskData,
  mockInventoryData,
  calculateOccupancyRate,
  generateFinancialSummary,
  calculateTaskCompletion
} from '@/utils/dashboard';

export interface DashboardData {
  tasks: Task[];
  bookings: any[];
  occupancyRate: number;
  financialSummary: any;
  taskCompletion: number;
  inventoryAlerts: any[];
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const { tasks } = useTaskManagement();

  const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
      // Use mock data and calculations
      const bookings = mockBookingData;
      const inventoryData = mockInventoryData;
      
      const dashboardData: DashboardData = {
        tasks: tasks || [],
        bookings,
        occupancyRate: calculateOccupancyRate(bookings),
        financialSummary: generateFinancialSummary(bookings),
        taskCompletion: calculateTaskCompletion(tasks || []),
        inventoryAlerts: inventoryData.filter(item => item.quantity <= item.minQuantity)
      };
      
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
      setLastRefresh(new Date());
      
      // Call the dashboard refresh function
      await refreshDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    
    // Set up auto-refresh
    const interval = setupAutoRefresh(refresh, 30000);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [tasks]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastRefresh,
    refreshStatus: getRefreshStatus()
  };
};
