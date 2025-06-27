
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
  return {
    id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
    title: task.title,
    property: task.property_id || 'Unknown',
    status: (task.status as TaskStatus) || "Pending",
    priority: (task.priority as "Low" | "Medium" | "High") || "Medium",
    dueDate: task.due_date,
    assignedTo: task.assigned_to || "Unassigned",
    description: task.description || "",
    approvalStatus: "Pending",
    photos: [],
    checklist: [],
    type: "Cleaning",
    createdAt: task.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system"
  };
};

export const createMockMaintenanceTask = (task: CombinedTask): MaintenanceTask => {
  const now = new Date().toISOString();

  return {
    id: parseInt(task.id) || Math.floor(Math.random() * 10000),
    title: task.title,
    property: task.property_id || 'Unknown',
    type: "Maintenance",
    status: (task.status as TaskStatus) || "Pending",
    priority: (task.priority as "Low" | "Medium" | "High") || "Medium",
    dueDate: task.due_date,
    assignee: task.assigned_to || "Unassigned",
    description: task.description || "",
    location: task.property_id || 'Unknown',
    specialInstructions: "",
    requiredTools: [],
    instructions: [],
    beforePhotos: [],
    afterPhotos: [],
    beforeVideos: [],
    afterVideos: [],
    createdAt: task.created_at || now,
  };
};
