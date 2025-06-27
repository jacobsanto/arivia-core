import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";

export interface CombinedTask {
  id: string;
  title: string;
  property: string;
  status: string;
  priority: string;
  dueDate: string | Date;
  assignedTo: string;
  description?: string;
  // Add missing fields to match Task interface
  createdAt: string;
  updatedAt: string;
  checklist: any[];
  createdBy: string;
  photos: string[];
}

export const combineTasks = (housekeepingTasks: Task[], maintenanceTasks: MaintenanceTask[]): CombinedTask[] => {
  const combined: CombinedTask[] = [];
  
  // Convert housekeeping tasks
  housekeepingTasks.forEach(task => {
    combined.push({
      id: task.id,
      title: task.title,
      property: task.property || task.propertyId || 'Unknown',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || new Date().toISOString(),
      assignedTo: task.assignedTo || 'Unassigned',
      description: task.description,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      checklist: task.checklist || [],
      createdBy: task.createdBy,
      photos: task.photos || []
    });
  });
  
  // Convert maintenance tasks
  maintenanceTasks.forEach(task => {
    combined.push({
      id: task.id.toString(),
      title: task.title,
      property: task.property,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignee || 'Unassigned',
      description: task.description,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: [],
      createdBy: 'system',
      photos: []
    });
  });
  
  return combined;
};
