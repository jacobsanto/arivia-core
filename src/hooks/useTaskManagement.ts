
import { useState, useEffect } from 'react';
import { Task, TaskService } from '@/services/task-management/task.service';
import { toast } from 'sonner';

export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await TaskService.getTasks();
      setTasks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await TaskService.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getMyTasks = async () => {
    try {
      return await TaskService.getTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch my tasks';
      toast.error(errorMessage);
      return [];
    }
  };

  const completeTask = async (id: string) => {
    try {
      const updatedTask = await TaskService.updateTask(id, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      toast.success('Task completed successfully');
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete task';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks,
    completeTask,
    refetch: fetchTasks
  };
};
