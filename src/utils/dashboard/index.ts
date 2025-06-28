
// Dashboard utilities export
export { formatCurrency, formatPercentage, formatDate, formatDateTime } from './formatUtils';
export { TaskRecord, getTaskStatusColor, getTaskPriorityColor, isTaskOverdue } from './taskUtils';
export { mockTaskData, mockBookingData, mockInventoryData } from './mockData';
export type { TaskRecord as DashboardTaskRecord } from './taskUtils';

// Re-export calculation utilities
import * as calculationUtils from './calculationUtils';
export { calculationUtils };

// Export individual calculation functions
export { calculateOccupancyRate, generateFinancialSummary, calculateTaskCompletion } from './calculationUtils';

// Dashboard data aggregation
export const getDashboardData = () => {
  const tasks = mockTaskData;
  const bookings = mockBookingData;
  const occupancyRate = calculationUtils.calculateOccupancyRate(bookings);
  const financialSummary = calculationUtils.generateFinancialSummary(bookings);
  const taskCompletion = calculationUtils.calculateTaskCompletion(tasks);
  const inventory = mockInventoryData;

  return {
    tasks,
    bookings,
    occupancyRate,
    financialSummary,
    taskCompletion,
    inventory,
    // Quick stats
    stats: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      totalBookings: bookings.length,
      totalRevenue: financialSummary.totalRevenue,
      occupancyRate,
      taskCompletionRate: taskCompletion
    }
  };
};

// Additional dashboard utilities
export const refreshDashboardData = async () => {
  // Placeholder for dashboard refresh logic
  console.log('Refreshing dashboard data...');
  return getDashboardData();
};

export const setupAutoRefresh = (intervalMs: number = 30000, callback: () => void) => {
  const interval = setInterval(callback, intervalMs);
  return () => clearInterval(interval);
};

export const getRefreshStatus = () => {
  // Placeholder for refresh status logic
  return {
    isRefreshing: false,
    lastRefreshed: new Date(),
    nextRefresh: new Date(Date.now() + 30000)
  };
};
