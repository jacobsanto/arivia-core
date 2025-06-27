
import { useState, useEffect } from 'react';
import { Task, TaskFilters, CreateTaskData, UpdateTaskData } from '@/types/task-management';
import { TaskService } from '@/services/task-management/task.service';
import { useTenant } from '@/lib/context/TenantContext';

export const useTaskManagement = () => {
  const { tenantId } = useTenant();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});

  const refreshTasks = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    const fetchedTasks = await TaskService.getTasks(filters);
    setTasks(fetchedTasks);
    setLoading(false);
  };

  const createTask = async (taskData: CreateTaskData) => {
    if (!tenantId) return null;
    
    const newTask = await TaskService.createTask(tenantId, taskData);
    if (newTask) {
      await refreshTasks();
    }
    return newTask;
  };

  const updateTask = async (taskId: string, updates: UpdateTaskData) => {
    const success = await TaskService.updateTask(taskId, updates);
    if (success) {
      await refreshTasks();
    }
    return success;
  };

  const completeTask = async (taskId: string) => {
    const success = await TaskService.completeTask(taskId);
    if (success) {
      await refreshTasks();
    }
    return success;
  };

  const deleteTask = async (taskId: string) => {
    const success = await TaskService.deleteTask(taskId);
    if (success) {
      await refreshTasks();
    }
    return success;
  };

  const applyFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    refreshTasks();
  }, [tenantId, filters]);

  return {
    tasks,
    loading,
    filters,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    refreshTasks,
    applyFilters
  };
};

export const useMyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = async () => {
    setLoading(true);
    const fetchedTasks = await TaskService.getMyTasks();
    setTasks(fetchedTasks);
    setLoading(false);
  };

  const completeTask = async (taskId: string) => {
    const success = await TaskService.completeTask(taskId);
    if (success) {
      await refreshTasks();
    }
    return success;
  };

  const updateTaskStatus = async (taskId: string, status: 'in_progress' | 'completed') => {
    const updates: UpdateTaskData = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const success = await TaskService.updateTask(taskId, updates);
    if (success) {
      await refreshTasks();
    }
    return success;
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  return {
    tasks,
    loading,
    completeTask,
    updateTaskStatus,
    refreshTasks
  };
};
