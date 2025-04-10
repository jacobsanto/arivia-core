
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guestyApiService } from "@/integrations/guesty/api";
import { adaptGuestyTask, formatGuestyDate } from "@/integrations/guesty/adapters";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useGuestyTasks = (options: {
  type: 'housekeeping' | 'maintenance';
  limit?: number;
  propertyIds?: string[];
  statuses?: ('pending' | 'inProgress' | 'completed' | 'canceled')[];
  startDate?: Date;
  endDate?: Date;
} = { type: 'housekeeping' }) => {
  const [limit, setLimit] = useState(options.limit || 10);
  const [skip, setSkip] = useState(0);
  
  // Reset skip when filters change
  useEffect(() => {
    setSkip(0);
  }, [options.propertyIds, options.statuses, options.startDate, options.endDate, limit]);
  
  const query = useQuery({
    queryKey: [
      'guestyTasks', 
      options.type,
      limit, 
      skip, 
      options.propertyIds, 
      options.statuses, 
      options.startDate, 
      options.endDate
    ],
    queryFn: async () => {
      // Filter by task type in the API call
      const taskTypeFilter = options.type === 'housekeeping' ? 'Housekeeping' : 'Maintenance';
      
      const response = await guestyApiService.getTasks({
        limit,
        skip,
        listingIds: options.propertyIds,
        statuses: options.statuses,
        dueDateGte: options.startDate ? options.startDate.toISOString() : undefined,
        dueDateLte: options.endDate ? options.endDate.toISOString() : undefined
      });
      
      // Filter results by task type and adapt to our model
      const filteredTasks = response.results
        .filter(task => task.taskType === taskTypeFilter)
        .map(task => adaptGuestyTask(task, options.type));
      
      return {
        tasks: filteredTasks,
        pagination: {
          total: response.total,
          count: filteredTasks.length, // Use filtered count
          limit: response.limit,
          skip: response.skip
        }
      };
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const loadMore = () => {
    if (!query.data) return;
    setSkip(skip + limit);
  };
  
  const hasMore = query.data ? (skip + query.data.pagination.count) < query.data.pagination.total : false;
  
  return {
    ...query,
    tasks: query.data?.tasks || [],
    pagination: query.data?.pagination,
    setLimit,
    loadMore,
    hasMore
  };
};

export const useGuestyTask = (taskId: string, type: 'housekeeping' | 'maintenance') => {
  return useQuery({
    queryKey: ['guestyTask', taskId, type],
    queryFn: async () => {
      const task = await guestyApiService.getTask(taskId);
      return adaptGuestyTask(task, type);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!taskId
  });
};

export const useCreateGuestyTask = (type: 'housekeeping' | 'maintenance') => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      status: 'pending' | 'inProgress' | 'completed' | 'canceled';
      priority: 'low' | 'normal' | 'high' | 'urgent';
      propertyId?: string;
      assigneeId?: string;
      dueDate: Date;
    }) => {
      const guestyTask = await guestyApiService.createTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        taskType: type === 'housekeeping' ? 'Housekeeping' : 'Maintenance',
        listingId: task.propertyId,
        assigneeId: task.assigneeId,
        dueDate: formatGuestyDate(task.dueDate)
      });
      
      return adaptGuestyTask(guestyTask, type);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['guestyTasks', type] });
      toast.success(`${type === 'housekeeping' ? 'Housekeeping' : 'Maintenance'} task created successfully`);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error(`Failed to create ${type} task`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
};

export const useUpdateGuestyTask = (type: 'housekeeping' | 'maintenance') => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      taskId,
      updates
    }: {
      taskId: string;
      updates: {
        title?: string;
        description?: string;
        status?: 'pending' | 'inProgress' | 'completed' | 'canceled';
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        propertyId?: string;
        assigneeId?: string;
        dueDate?: Date;
      }
    }) => {
      const guestyUpdates: any = {};
      
      if (updates.title !== undefined) guestyUpdates.title = updates.title;
      if (updates.description !== undefined) guestyUpdates.description = updates.description;
      if (updates.status !== undefined) guestyUpdates.status = updates.status;
      if (updates.priority !== undefined) guestyUpdates.priority = updates.priority;
      if (updates.propertyId !== undefined) guestyUpdates.listingId = updates.propertyId;
      if (updates.assigneeId !== undefined) guestyUpdates.assigneeId = updates.assigneeId;
      if (updates.dueDate !== undefined) guestyUpdates.dueDate = formatGuestyDate(updates.dueDate);
      
      const guestyTask = await guestyApiService.updateTask(taskId, guestyUpdates);
      return adaptGuestyTask(guestyTask, type);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['guestyTasks', type] });
      queryClient.invalidateQueries({ queryKey: ['guestyTask', variables.taskId, type] });
      toast.success(`${type === 'housekeeping' ? 'Housekeeping' : 'Maintenance'} task updated successfully`);
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error(`Failed to update ${type} task`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
};
