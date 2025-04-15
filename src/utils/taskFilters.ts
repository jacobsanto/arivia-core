
import { Task } from "../types/taskTypes";

export const filterTasks = (
  tasks: Task[],
  searchQuery: string,
  activeTab: string,
  propertyFilter: string,
  typeFilter: string,
  cleaningTypeFilter: string = "all"
): Task[] => {
  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed") ||
      (activeTab === "needsApproval" && task.status === "Completed" && task.approvalStatus === "Pending");

    const matchesProperty = propertyFilter === "all" || task.property === propertyFilter;

    const matchesType = typeFilter === "all" || task.type === typeFilter;
    
    // New filter for cleaning types
    const matchesCleaningType = 
      cleaningTypeFilter === "all" || 
      !task.cleaningDetails || 
      (task.cleaningDetails && task.cleaningDetails.cleaningType === cleaningTypeFilter);

    return matchesSearch && matchesTab && matchesProperty && matchesType && matchesCleaningType;
  });
};
