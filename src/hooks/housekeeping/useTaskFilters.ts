
import { useState, useEffect } from "react";
import { Task } from "@/types/housekeepingTypes";
// Simple date range type

export const useTaskFilters = (tasks: Task[]) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date} | undefined>(undefined);

  useEffect(() => {
    let filtered = [...tasks];
    
    if (taskTypeFilter !== 'all') {
      filtered = filtered.filter(task => task.task_type === taskTypeFilter);
    }
    
    if (assignedToFilter !== 'all') {
      if (assignedToFilter === 'unassigned') {
        filtered = filtered.filter(task => !task.assigned_to);
      } else {
        filtered = filtered.filter(task => task.assigned_to === assignedToFilter);
      }
    }
    
    if (dateRange && dateRange.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.due_date);
        if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return taskDate >= startDate && taskDate <= endDate;
        }
        return taskDate >= startDate;
      });
    }
    
    setFilteredTasks(filtered);
  }, [tasks, taskTypeFilter, assignedToFilter, dateRange]);

  return {
    filteredTasks,
    taskTypeFilter,
    setTaskTypeFilter,
    assignedToFilter,
    setAssignedToFilter,
    dateRange,
    setDateRange
  };
};
