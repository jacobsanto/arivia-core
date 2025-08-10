
import { useTaskFetching } from "./housekeeping/useTaskFetching";
import { useCleaningDefinitions } from "./housekeeping/useCleaningDefinitions";
import { useTaskFilters } from "./housekeeping/useTaskFilters";
import { useTaskActions } from "./housekeeping/useTaskActions";
import { toast } from '@/hooks/use-toast';

export const useHousekeepingTasks = () => {
  const { tasks, loading, taskTypeOptions, staffOptions } = useTaskFetching();
  const { cleaningDefinitions } = useCleaningDefinitions();
  const {
    filteredTasks,
    taskTypeFilter,
    setTaskTypeFilter,
    assignedToFilter,
    setAssignedToFilter,
    dateRange,
    setDateRange
  } = useTaskFilters(tasks);
  const { handleTaskStatusUpdate, handleAssignTask } = useTaskActions();

  return {
    tasks: filteredTasks,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    assignedToFilter,
    setAssignedToFilter,
    dateRange,
    setDateRange,
    taskTypeOptions,
    staffOptions,
    cleaningDefinitions,
    handleTaskStatusUpdate,
    handleAssignTask
  };
};
