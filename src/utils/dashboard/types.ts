
/**
 * Define a type for task records to avoid infinite type instantiation
 */
export interface TaskRecord {
  id: string;
  status: string;
  due_date: string;
  priority?: string;
  title: string;
  property_id?: string;
  description?: string;
  assigned_to?: string;
  location?: string;
  [key: string]: any;
}

/**
 * Define the dashboard data structure
 */
export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance?: number;
    available?: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress?: number;
  };
  maintenance: {
    total: number;
    critical: number;
    standard: number;
  };
  upcomingTasks?: TaskRecord[];
  housekeepingTasks?: TaskRecord[];
  maintenanceTasks?: TaskRecord[];
  quickStats?: {
    occupancyRate: number;
    avgRating: number;
    revenueToday: number;
    pendingCheckouts: number;
  };
}
