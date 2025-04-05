
import { DateRangeFilter, MaintenanceTask } from "../types/maintenanceTypes";

export const filterMaintenanceTasks = (
  tasks: MaintenanceTask[],
  searchQuery: string,
  activeTab: string,
  propertyFilter: string,
  priorityFilter: string,
  dateRange?: DateRangeFilter
) => {
  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.specialInstructions && task.specialInstructions.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed");

    const matchesProperty = 
      propertyFilter === "all" || task.property === propertyFilter;

    const matchesPriority = 
      priorityFilter === "all" || task.priority === priorityFilter;
      
    // Date range filtering
    const matchesDateRange = !dateRange || !dateRange.startDate || !dateRange.endDate ||
      (new Date(task.createdAt) >= dateRange.startDate && new Date(task.createdAt) <= dateRange.endDate);

    return matchesSearch && matchesTab && matchesProperty && matchesPriority && matchesDateRange;
  });
};
