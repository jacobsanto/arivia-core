
// Dashboard utilities
export { formatCurrency } from './formatUtils';
export { generateTaskId, createTaskFromTemplate } from './taskUtils';
export { mockBookingData, mockTaskData, mockInventoryData } from './mockData';
export { 
  calculateOccupancyRate, 
  generateFinancialSummary, 
  calculateTaskCompletion 
} from './calculationUtils';

// Placeholder functions for refresh functionality
export const refreshDashboardData = async () => {
  console.log('Dashboard data refresh triggered');
};

export const setupAutoRefresh = (callback: () => void, interval: number = 30000) => {
  return setInterval(callback, interval);
};

export const getRefreshStatus = () => {
  return {
    lastRefresh: new Date(),
    isRefreshing: false,
    nextRefresh: new Date(Date.now() + 30000)
  };
};
