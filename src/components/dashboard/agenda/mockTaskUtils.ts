
// This file will be replaced by real data processing utilities
import { Task, TaskStatus } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { CombinedTask } from "./agendaUtils";

// These utilities now return empty or default values until connected to real data
export const getRandomStatus = () => 'pending';
export const getRandomPriority = () => 'normal';
export const getRandomAssignee = () => 'Unassigned';
export const getTimeDisplay = (date: Date) => {
  return date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
};

export const createMockHousekeepingTask = (task: CombinedTask): Task => {
  // Convert the task.dueDate to string if it's not already
  const dueDateString = typeof task.dueDate === 'object' 
    ? task.dueDate.toISOString()
    : task.dueDate;

  return {
    id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
    title: task.title,
    property: task.property,
    status: (task.status as TaskStatus) || "Pending",
    priority: (task.priority as "Low" | "Medium" | "High") || "Medium",
    dueDate: dueDateString,
    assignedTo: task.assignedTo || "Unassigned",
    description: task.description || "",
    approvalStatus: "Pending",
    photos: [],
    checklist: [],
    type: "Cleaning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system"
  };
};

export const createMockMaintenanceTask = (task: CombinedTask): MaintenanceTask => {
  // Convert the task.dueDate to string if it's not already
  const dueDateString = typeof task.dueDate === 'object' 
    ? task.dueDate.toISOString()
    : task.dueDate;
  
  // Current date for createdAt field
  const now = new Date().toISOString();

  return {
    id: parseInt(task.id) || Math.floor(Math.random() * 10000),
    title: task.title,
    property: task.property,
    type: "Maintenance",
    status: (task.status as TaskStatus) || "Pending",
    priority: (task.priority as "Low" | "Medium" | "High") || "Medium",
    dueDate: dueDateString,
    assignee: task.assignedTo || "Unassigned",
    description: task.description || "",
    location: task.property,
    specialInstructions: "",
    requiredTools: [],
    instructions: [],
    beforePhotos: [],
    afterPhotos: [],
    beforeVideos: [],
    afterVideos: [],
    createdAt: now,
  };
};
