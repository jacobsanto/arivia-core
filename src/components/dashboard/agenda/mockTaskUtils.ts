
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { CombinedTask } from "./agendaUtils";

export const createMockHousekeepingTask = (task: CombinedTask): Task => {
  return {
    id: task.id,
    title: task.title,
    property: task.property,
    type: task.type,
    status: task.status as any, // Type casting to resolve compatibility
    priority: task.priority as "Low" | "Medium" | "High", // Type casting
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString(),
    assignedTo: "Assigned Staff", // This would come from the actual task data
    description: "Task details would be loaded here in a real implementation.",
    approvalStatus: "Pending" as any,
    rejectionReason: null,
    photos: [],
    checklist: [
      { id: 1, title: "Sample checklist item 1", completed: false },
      { id: 2, title: "Sample checklist item 2", completed: false }
    ]
  };
};

export const createMockMaintenanceTask = (task: CombinedTask): MaintenanceTask => {
  return {
    id: parseInt(task.id) || Math.floor(Math.random() * 1000), // Convert to number or generate random
    title: task.title,
    property: task.property,
    status: task.status,
    priority: task.priority,
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString(),
    assignee: "Maintenance Staff",
    description: "Maintenance task details would be loaded here in a real implementation.",
    location: "Location details",
    specialInstructions: "Special instructions would appear here",
    requiredTools: ["Tool 1", "Tool 2"],
    instructions: [
      { id: 1, title: "Sample instruction 1", completed: false },
      { id: 2, title: "Sample instruction 2", completed: false }
    ],
    beforePhotos: [],
    afterPhotos: [],
    beforeVideos: [],
    afterVideos: [],
    createdAt: new Date().toISOString(),
    type: "Maintenance"
  };
};
