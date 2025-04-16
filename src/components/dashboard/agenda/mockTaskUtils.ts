
// Mock task utilities for development purposes
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { CombinedTask } from "./agendaUtils";

export const getRandomStatus = () => 'pending';
export const getRandomPriority = () => 'normal';
export const getRandomAssignee = () => 'Unassigned';
export const getTimeDisplay = (date: Date) => '12:00 PM';

export const createMockHousekeepingTask = (task: CombinedTask): Task => {
  return {
    id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
    title: task.title,
    property: task.property,
    status: task.status || "Pending",
    priority: task.priority || "Medium",
    dueDate: task.dueDate,
    assignedTo: task.assignedTo || "Unassigned",
    description: task.description || "",
    approvalStatus: "Pending",
    photos: [],
    checklist: [
      { id: 1, title: "Clean bathroom", completed: false },
      { id: 2, title: "Change linens", completed: false },
      { id: 3, title: "Vacuum floors", completed: false },
    ]
  };
};

export const createMockMaintenanceTask = (task: CombinedTask): MaintenanceTask => {
  return {
    id: task.id || `maintenance-${Math.random().toString(36).substr(2, 9)}`,
    title: task.title,
    property: task.property,
    status: task.status || "Pending",
    priority: task.priority || "Medium",
    dueDate: task.dueDate,
    assignee: task.assignedTo || "Unassigned",
    description: task.description || "",
    location: task.property,
    requiredTools: ["Screwdriver", "Wrench"],
    instructions: [
      { id: 1, title: "Check AC filter", completed: false },
      { id: 2, title: "Test thermostat", completed: false }
    ],
    beforePhotos: [],
    afterPhotos: []
  };
};
