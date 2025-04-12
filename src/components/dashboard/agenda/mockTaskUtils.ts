
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { CombinedTask } from "./agendaUtils";

export const createMockHousekeepingTask = (task: CombinedTask): Task => {
  return {
    id: task.id,
    title: task.title,
    property: task.property,
    type: task.type,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: "Assigned Staff", // This would come from the actual task data
    description: "Task details would be loaded here in a real implementation.",
    approvalStatus: "Pending",
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
    id: task.id,
    title: task.title,
    property: task.property,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
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
