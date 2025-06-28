
import { useState, useEffect } from 'react';
import { Task } from '@/services/task-management/task.service';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export interface CombinedTask extends Task {
  source: 'task' | 'booking' | 'maintenance';
}

export const useAgendaData = () => {
  const { tasks, isLoading } = useTaskManagement();
  const [todayTasks, setTodayTasks] = useState<CombinedTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<CombinedTask[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<CombinedTask[]>([]);

  useEffect(() => {
    if (!tasks) return;

    const today: CombinedTask[] = [];
    const upcoming: CombinedTask[] = [];
    const overdue: CombinedTask[] = [];

    tasks.forEach(task => {
      const combinedTask: CombinedTask = { ...task, source: 'task' };
      const dueDate = task.due_date ? new Date(task.due_date) : new Date();

      if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed') {
        overdue.push(combinedTask);
      } else if (isToday(dueDate)) {
        today.push(combinedTask);
      } else if (isTomorrow(dueDate) || dueDate > new Date()) {
        upcoming.push(combinedTask);
      }
    });

    setTodayTasks(today);
    setUpcomingTasks(upcoming);
    setOverdueTasks(overdue);
  }, [tasks]);

  return {
    todayTasks,
    upcomingTasks,
    overdueTasks,
    isLoading
  };
};
