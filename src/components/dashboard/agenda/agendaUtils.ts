
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { isSameDay } from "date-fns";

export interface CombinedTask {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  priority: string;
  property: string;
  taskType: "housekeeping" | "maintenance";
  status: string;
}

export const combineTasks = (
  housekeepingTasks: Task[],
  maintenanceTasks: MaintenanceTask[]
): CombinedTask[] => {
  return [
    ...housekeepingTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: task.type,
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "housekeeping" as const
    })),
    ...maintenanceTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: "Maintenance",
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "maintenance" as const
    }))
  ];
};

export const filterTasksForSelectedDate = (tasks: CombinedTask[], selectedDate: Date): CombinedTask[] => {
  return tasks.filter(task => {
    try {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, selectedDate);
    } catch (e) {
      console.error("Invalid date format for task:", task.title);
      return false;
    }
  });
};

export const sortTasksByTime = (tasks: CombinedTask[]): CombinedTask[] => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });
};

export const groupTasksByTimeOfDay = (tasks: CombinedTask[]) => {
  const morningTasks = tasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 5 && hour < 12;
  });

  const afternoonTasks = tasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 12 && hour < 18;
  });

  const eveningTasks = tasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 18 || hour < 5;
  });

  return { morningTasks, afternoonTasks, eveningTasks };
};
