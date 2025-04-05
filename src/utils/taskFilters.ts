
import { Task } from "../types/taskTypes";

export const filterTasks = (
  tasks: Task[],
  searchQuery: string,
  activeTab: string,
  propertyFilter: string,
  typeFilter: string
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

    const matchesType = task.type === "Housekeeping";

    return matchesSearch && matchesTab && matchesProperty && matchesType;
  });
};
