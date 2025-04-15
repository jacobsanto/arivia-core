
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { format, parse, isSameDay } from "date-fns";

export interface CombinedTask {
  id: string;
  title: string;
  type: string;
  dueDate: string | Date;
  priority: string;
  property: string;
  status: string;
  taskType: "housekeeping" | "maintenance";
}

export const combineTasks = (
  housekeepingTasks: Task[],
  maintenanceTasks: MaintenanceTask[]
): CombinedTask[] => {
  return [
    ...housekeepingTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: task.type || "Housekeeping",
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "housekeeping" as const
    })),
    ...maintenanceTasks.map(task => ({
      id: task.id.toString(),
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
      if (typeof task.dueDate === 'object' && task.dueDate !== null && 'getTime' in task.dueDate) {
        return isSameDay(task.dueDate as Date, selectedDate);
      }

      let taskDate;
      if (typeof task.dueDate === 'string') {
        if (task.dueDate.includes('T')) {
          taskDate = new Date(task.dueDate);
        } else if (task.dueDate.includes('/')) {
          taskDate = parse(task.dueDate, 'MM/dd/yyyy', new Date());
        } else {
          taskDate = parse(task.dueDate, 'yyyy-MM-dd', new Date());
        }
      } else {
        console.error("Invalid date format for task:", task.title);
        return false;
      }

      return isSameDay(taskDate, selectedDate);
    } catch (e) {
      console.error("Error parsing date for task:", task.title, e);
      return false;
    }
  });
};

export const sortTasksByTime = (tasks: CombinedTask[]): CombinedTask[] => {
  return [...tasks].sort((a, b) => {
    const getTime = (dateStr: string | Date) => {
      try {
        if (typeof dateStr === 'object' && dateStr !== null && 'getTime' in dateStr) {
          return (dateStr as Date).getTime();
        }
        return new Date(String(dateStr)).getTime();
      } catch {
        return 0;
      }
    };

    return getTime(a.dueDate) - getTime(b.dueDate);
  });
};

export const groupTasksByTimeOfDay = (tasks: CombinedTask[]) => {
  const morningTasks: CombinedTask[] = [];
  const afternoonTasks: CombinedTask[] = [];
  const eveningTasks: CombinedTask[] = [];

  tasks.forEach(task => {
    try {
      let hour;
      
      if (typeof task.dueDate === 'object' && task.dueDate !== null && 'getHours' in task.dueDate) {
        hour = (task.dueDate as Date).getHours();
      } else {
        const date = new Date(String(task.dueDate));
        hour = date.getHours();
      }

      if (hour < 12) {
        morningTasks.push(task);
      } else if (hour < 17) {
        afternoonTasks.push(task);
      } else {
        eveningTasks.push(task);
      }
    } catch (e) {
      morningTasks.push(task);
    }
  });

  return { morningTasks, afternoonTasks, eveningTasks };
};
