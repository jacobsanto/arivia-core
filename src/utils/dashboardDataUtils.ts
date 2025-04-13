
// Import necessary types
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { initialTasks as initialHousekeepingTasks } from "@/data/taskData";
import { initialTasks as initialMaintenanceTasks } from "@/data/maintenanceTasks";

type DashboardData = {
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
  bookings: any[];
  upcomingTasks: any[];
};

/**
 * Get dashboard data for the selected property
 */
export const getDashboardData = (propertyFilter: string): DashboardData => {
  // In a real app, this would fetch data from an API based on the property filter
  
  // For demo purposes, we're generating some sample data
  const housekeepingTasks: Task[] = initialHousekeepingTasks || [];
  const maintenanceTasks: MaintenanceTask[] = initialMaintenanceTasks || [];
  
  // Count tasks and maintenance items
  const totalTasks = housekeepingTasks.length;
  const completedTasks = housekeepingTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  
  const totalMaintenance = maintenanceTasks.length;
  const criticalMaintenance = maintenanceTasks.filter(task => task.priority === 'high').length;
  const standardMaintenance = totalMaintenance - criticalMaintenance;
  
  // Create data object with all required properties
  const dashboardData: DashboardData = {
    properties: {
      total: 5, // Sample data
      occupied: 3,
      vacant: 2
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks
    },
    maintenance: {
      total: totalMaintenance,
      critical: criticalMaintenance,
      standard: standardMaintenance
    },
    bookings: [],
    upcomingTasks: housekeepingTasks.filter(task => 
      task.status !== 'completed'
    ).slice(0, 5)
  };
  
  return dashboardData;
};
