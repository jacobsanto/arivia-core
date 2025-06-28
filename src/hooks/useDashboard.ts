
import { useState, useEffect } from 'react';
import { 
  getDashboardData,
  refreshDashboardData,
  setupAutoRefresh,
  getRefreshStatus,
  calculationUtils
} from '@/utils/dashboard';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(getDashboardData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState(getRefreshStatus());

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newData = await refreshDashboardData();
      setDashboardData(newData);
      setRefreshStatus(getRefreshStatus());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error refreshing dashboard';
      setError(errorMessage);
      console.error('Error refreshing dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = setupAutoRefresh(30000, refresh);
    return cleanup;
  }, []);

  // Convert inventory items to have consistent naming
  const normalizedInventory = dashboardData.inventory.map(item => ({
    ...item,
    minQuantity: item.min_quantity || 0
  }));

  return {
    data: dashboardData,
    ...dashboardData,
    inventory: normalizedInventory,
    isLoading,
    error,
    refreshStatus,
    refresh,
    lastRefresh: refreshStatus.lastRefreshed,
    // Utility functions
    calculateOccupancyRate: calculationUtils.calculateOccupancyRate,
    generateFinancialSummary: calculationUtils.generateFinancialSummary,
    calculateTaskCompletion: calculationUtils.calculateTaskCompletion
  };
};
