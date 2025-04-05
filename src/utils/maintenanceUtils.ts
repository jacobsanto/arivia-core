
import { MaintenanceReport, MaintenanceTask } from "../types/maintenanceTypes";
import { toast } from "sonner";

export const completeTask = (task: MaintenanceTask) => {
  toast.success(`Task "${task.title}" marked as complete!`);
  return task;
};

export const toggleInstruction = (task: MaintenanceTask, itemId: number) => {
  if (!task) return task;
  
  const updatedInstructions = task.instructions.map((item) => {
    if (item.id === itemId) {
      return { ...item, completed: !item.completed };
    }
    return item;
  });
  
  return {
    ...task,
    instructions: updatedInstructions,
  };
};

export const submitReport = (report: MaintenanceReport) => {
  toast.success("Maintenance report submitted successfully!");
  return report;
};

export const uploadPhoto = (file: File, type: 'before' | 'after') => {
  console.log(`${type} photo uploaded:`, file.name);
  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded for task!`);
};

export const createMaintenanceTask = (data: any) => {
  const requiredTools = data.requiredTools 
    ? data.requiredTools.split(',').map((item: string) => item.trim()).filter((item: string) => item)
    : [];

  toast.success(`Maintenance task "${data.title}" created successfully!`);
  return { ...data, requiredTools };
};
