
import { format, subDays } from 'date-fns';
import { DateRange } from "@/components/reports/DateRangeSelector";

// Define the structure for dashboard data
export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  maintenance: {
    total: number;
    critical: number;
    standard: number;
  };
  upcomingTasks: Array<{
    id: string;
    title: string;
    due_date: string;
    status: string;
    type: string;
  }>;
  housekeepingTasks: Array<any>;
  maintenanceTasks: Array<any>;
  quickStats: {
    occupancyRate: number;
    avgRating: number;
    revenueToday: number;
    pendingCheckouts: number;
  };
}

// Get default/fallback dashboard data
export const getDefaultDashboardData = (): DashboardData => {
  return {
    properties: {
      total: 0,
      occupied: 0,
      vacant: 0
    },
    tasks: {
      total: 0,
      completed: 0,
      pending: 0
    },
    maintenance: {
      total: 0,
      critical: 0,
      standard: 0
    },
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
};

// Async function to get dashboard data - now properly async
export const getDashboardData = async (
  selectedProperty: string = "all",
  dateRange: DateRange
): Promise<DashboardData> => {
  try {
    // Import the dashboard fetcher
    const { fetchDashboardData } = await import("@/utils/dashboard");
    
    // Ensure we have valid dates
    const safeRange = {
      from: dateRange.from || subDays(new Date(), 30),
      to: dateRange.to || new Date()
    };
    
    // Fetch data from the database
    const data = await fetchDashboardData(selectedProperty, safeRange);
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return default data if fetching fails
    return getDefaultDashboardData();
  }
};

// Legacy sync version for backward compatibility - deprecated
export const getDashboardDataSync = (
  selectedProperty: string = "all", 
  dateRange: DateRange
): DashboardData => {
  console.warn('getDashboardDataSync is deprecated. Use getDashboardData instead.');
  return getDefaultDashboardData();
};
