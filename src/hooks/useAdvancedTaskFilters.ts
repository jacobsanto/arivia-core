import { useState, useMemo } from "react";

interface TaskFilters {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  propertyFilter: string;
  taskTypeFilter: string;
}

interface Task {
  id: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  listing_id?: string;
  task_type?: string;
  due_date: string;
  created_at: string;
}

export const useAdvancedTaskFilters = (tasks: Task[]) => {
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: "",
    statusFilter: "all",
    priorityFilter: "all",
    assigneeFilter: "all",
    propertyFilter: "all",
    taskTypeFilter: "all",
  });

  const [sortBy, setSortBy] = useState<"due_date" | "created_at" | "priority">("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.listing_id?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "overdue") {
          const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed";
          if (!isOverdue) return false;
        } else {
          if (task.status !== filters.statusFilter) return false;
        }
      }

      // Priority filter
      if (filters.priorityFilter !== "all" && task.priority !== filters.priorityFilter) {
        return false;
      }

      // Task type filter
      if (filters.taskTypeFilter !== "all" && task.task_type !== filters.taskTypeFilter) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeFilter !== "all") {
        if (filters.assigneeFilter === "unassigned" && task.assigned_to) {
          return false;
        }
        if (filters.assigneeFilter === "me") {
          // This would need to be implemented with current user ID
          // For now, we'll skip this filter
        }
        if (filters.assigneeFilter !== "unassigned" && filters.assigneeFilter !== "me" && task.assigned_to !== filters.assigneeFilter) {
          return false;
        }
      }

      // Property filter
      if (filters.propertyFilter !== "all" && task.listing_id !== filters.propertyFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "due_date":
          aValue = new Date(a.due_date);
          bValue = new Date(b.due_date);
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters, sortBy, sortOrder]);

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      priorityFilter: "all",
      assigneeFilter: "all",
      propertyFilter: "all",
      taskTypeFilter: "all",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "all" && value !== "").length;

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredAndSortedTasks,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    activeFiltersCount,
  };
};