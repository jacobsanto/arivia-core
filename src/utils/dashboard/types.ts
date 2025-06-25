/**
 * Define a type for task records to avoid infinite type instantiation
 * Unified interface for both housekeeping and maintenance tasks
 */
export interface TaskRecord {
  id: string;
  status: string;
  due_date: string;
  priority?: string;
  title: string;
  property_id?: string;
  description?: string;
  assigned_to?: string | null;
  location?: string;
  // Housekeeping-specific fields
  task_type?: string;
  cleaning_type?: string;
  booking_id?: string;
  listing_id?: string;
  [key: string]: any;
}

/**
 * Define the dashboard data structure with consistent property handling
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
  // Property context for data filtering
  selectedProperty?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
