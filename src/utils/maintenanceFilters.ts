
import { MaintenanceTask } from "../types/maintenanceTypes";

export const filterMaintenanceTasks = (
  tasks: MaintenanceTask[],
  searchQuery: string,
  activeTab: string,
  propertyFilter: string,
  priorityFilter: string
) => {
  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed");

    const matchesProperty = 
      propertyFilter === "all" || task.property === propertyFilter;

    const matchesPriority = 
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesTab && matchesProperty && matchesPriority;
  });
};
