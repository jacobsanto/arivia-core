
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
  const [refreshStatus, setRefreshStatus] = useState(getRefreshStatus());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const newData = await refreshDashboardData();
      setDashboardData(newData);
      setRefreshStatus(getRefreshStatus());
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = setupAutoRefresh(30000, refreshData);
    return cleanup;
  }, []);

  // Convert inventory items to have consistent naming
  const normalizedInventory = dashboardData.inventory.map(item => ({
    ...item,
    minQuantity: item.min_quantity || 0
  }));

  return {
    ...dashboardData,
    inventory: normalizedInventory,
    isLoading,
    refreshStatus,
    refreshData,
    // Utility functions
    calculateOccupancyRate: calculationUtils.calculateOccupancyRate,
    generateFinancialSummary: calculationUtils.generateFinancialSummary,
    calculateTaskCompletion: calculationUtils.calculateTaskCompletion
  };
};
