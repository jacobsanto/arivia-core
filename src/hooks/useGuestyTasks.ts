
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guestyClient } from "@/integrations/guesty/client";
import { GuestyTask, GuestyPaginatedResponse } from "@/types/guesty";
import { useState } from "react";
import { toastService } from "@/services/toast/toast.service";

interface TasksQueryParams {
  limit?: number;
  skip?: number;
  listingId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  sort?: string;
}

export const useGuestyTasks = (initialParams: TasksQueryParams = { limit: 20, skip: 0 }) => {
  const [queryParams, setQueryParams] = useState<TasksQueryParams>(initialParams);
  const queryClient = useQueryClient();

  // Fetch tasks with filters
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['guestyTasks', queryParams],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (queryParams.limit) params.limit = queryParams.limit.toString();
      if (queryParams.skip) params.skip = queryParams.skip.toString();
      if (queryParams.listingId) params.listingId = queryParams.listingId;
      if (queryParams.assigneeId) params.assigneeId = queryParams.assigneeId;
      if (queryParams.status) params.status = queryParams.status;
      if (queryParams.priority) params.priority = queryParams.priority;
      if (queryParams.sort) params.sort = queryParams.sort;
      
      return guestyClient.get<GuestyPaginatedResponse<GuestyTask>>('/tasks', params);
    }
  });

  // Get a single task by ID
  const getTask = async (id: string) => {
    return guestyClient.get<GuestyTask>(`/tasks/${id}`);
  };

  // Create a new task
  const createTask = useMutation({
    mutationFn: (data: Partial<GuestyTask>) => {
      return guestyClient.post<GuestyTask>('/tasks', data);
    },
    onSuccess: () => {
      // Invalidate and refetch the tasks query after creating a new one
      queryClient.invalidateQueries({ queryKey: ['guestyTasks'] });
      
      toastService.success('Task created successfully', {
        description: 'The new task has been added to Guesty.'
      });
    },
    onError: (error) => {
      toastService.error('Failed to create task', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Update a task
  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestyTask> }) => {
      return guestyClient.put<GuestyTask>(`/tasks/${id}`, data);
    },
    onSuccess: (updatedTask) => {
      // Invalidate and refetch the tasks query after an update
      queryClient.invalidateQueries({ queryKey: ['guestyTasks'] });
      // Update the individual task in the cache
      queryClient.setQueryData(['guestyTask', updatedTask._id], updatedTask);
      
      toastService.success('Task updated successfully', {
        description: `Task "${updatedTask.title}" has been updated in Guesty.`
      });
    },
    onError: (error) => {
      toastService.error('Failed to update task', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Pagination controls
  const nextPage = () => {
    if (data && data.results.length === queryParams.limit) {
      setQueryParams({
        ...queryParams,
        skip: (queryParams.skip || 0) + (queryParams.limit || 20)
      });
    }
  };

  const prevPage = () => {
    if ((queryParams.skip || 0) > 0) {
      setQueryParams({
        ...queryParams,
        skip: Math.max(0, (queryParams.skip || 0) - (queryParams.limit || 20))
      });
    }
  };

  return {
    tasks: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    isError,
    error,
    refetch,
    queryParams,
    setQueryParams,
    nextPage,
    prevPage,
    getTask,
    createTask,
    updateTask
  };
};
