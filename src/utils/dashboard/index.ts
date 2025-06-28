
// Dashboard utilities
export { formatCurrency } from './formatUtils';
export { generateTaskId, createTaskFromTemplate } from './taskUtils';
export { mockBookingData, mockTaskData, mockInventoryData } from './mockData';
export { 
  calculateOccupancyRate, 
  generateFinancialSummary, 
  calculateTaskCompletion 
} from './calculationUtils';

// Task record type for weekly review
export interface TaskRecord {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  property_id?: string;
  location?: string; // Add location property
}

// Dashboard data interface
export interface DashboardData {
  tasks: any[];
  bookings: any[];
  occupancyRate: number;
  financialSummary: any;
  taskCompletion: number;
  inventoryAlerts: any[];
}

// Fetch dashboard data function
export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Mock implementation - replace with actual data fetching
  return {
    tasks: mockTaskData,
    bookings: mockBookingData,
    occupancyRate: calculateOccupancyRate(mockBookingData),
    financialSummary: generateFinancialSummary(mockBookingData),
    taskCompletion: calculateTaskCompletion(mockTaskData),
    inventoryAlerts: mockInventoryData.filter(item => item.quantity <= item.minQuantity)
  };
};

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
