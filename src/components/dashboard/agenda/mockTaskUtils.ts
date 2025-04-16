
// Mock task utilities for development purposes
import { Task, TaskStatus } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { CombinedTask } from "./agendaUtils";

export const getRandomStatus = () => 'pending';
export const getRandomPriority = () => 'normal';
export const getRandomAssignee = () => 'Unassigned';
export const getTimeDisplay = (date: Date) => '12:00 PM';

export const createMockHousekeepingTask = (task: CombinedTask): Task => {
  // Convert the task.dueDate to string if it's a Date object
  const dueDateString = typeof task.dueDate === 'object' 
    ? (task.dueDate as Date).toISOString() 
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
    checklist: [
      { id: 1, title: "Clean bathroom", completed: false },
      { id: 2, title: "Change linens", completed: false },
      { id: 3, title: "Vacuum floors", completed: false },
    ]
  };
};

export const createMockMaintenanceTask = (task: CombinedTask): MaintenanceTask => {
  // Convert the task.dueDate to string if it's a Date object
  const dueDateString = typeof task.dueDate === 'object' 
    ? (task.dueDate as Date).toISOString() 
    : task.dueDate;
  
  // Current date for createdAt field
  const now = new Date().toISOString();

  return {
    id: parseInt(task.id) || Math.floor(Math.random() * 10000), // Convert string ID to number
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
    requiredTools: ["Screwdriver", "Wrench"],
    instructions: [
      { id: 1, title: "Check AC filter", completed: false },
      { id: 2, title: "Test thermostat", completed: false }
    ],
    beforePhotos: [],
    afterPhotos: [],
    beforeVideos: [], // Added missing property
    afterVideos: [], // Added missing property
    createdAt: now, // Added missing property
  };
};
