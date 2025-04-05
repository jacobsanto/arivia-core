import { useState } from "react";
import { toast } from "sonner";

// Sample maintenance task data
const initialTasks = [
  {
    id: 1,
    title: "Fix AC in Villa Caldera Master Bedroom",
    property: "Villa Caldera",
    status: "Pending",
    priority: "High",
    dueDate: "2025-04-05T14:00:00",
    assignee: "Alex Chen",
    description: "AC unit is making loud noises and not cooling properly",
    location: "Master bedroom, second floor",
    requiredTools: ["Screwdriver set", "Multimeter", "Refrigerant gauge"],
    instructions: [
      { id: 1, title: "Check power supply to unit", completed: false },
      { id: 2, title: "Inspect fan and compressor", completed: false },
      { id: 3, title: "Clean condenser coils", completed: false },
      { id: 4, title: "Check refrigerant levels", completed: false },
      { id: 5, title: "Test thermostat function", completed: false },
    ],
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: 2,
    title: "Repair Leaking Sink in Villa Azure",
    property: "Villa Azure",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2025-04-06T10:30:00",
    assignee: "Maria Kowalska",
    description: "Kitchen sink has a slow leak under the drain connection",
    location: "Kitchen, main floor",
    requiredTools: ["Pipe wrench", "Plumber's tape", "Bucket", "Flashlight"],
    instructions: [
      { id: 1, title: "Turn off water supply", completed: true },
      { id: 2, title: "Remove items from under sink", completed: true },
      { id: 3, title: "Inspect drain connections", completed: false },
      { id: 4, title: "Replace gasket if needed", completed: false },
      { id: 5, title: "Test for leaks", completed: false },
    ],
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: 3,
    title: "Replace Broken Shower Head in Villa Sunset",
    property: "Villa Sunset",
    status: "Completed",
    priority: "Low",
    dueDate: "2025-04-03T09:00:00",
    assignee: "Alex Chen",
    description: "Master bathroom shower head is cracked and spraying in wrong direction",
    location: "Master bathroom, second floor",
    requiredTools: ["Adjustable wrench", "Plumber's tape", "New shower head"],
    instructions: [
      { id: 1, title: "Remove old shower head", completed: true },
      { id: 2, title: "Clean shower arm threads", completed: true },
      { id: 3, title: "Apply plumber's tape", completed: true },
      { id: 4, title: "Install new shower head", completed: true },
      { id: 5, title: "Test water flow", completed: true },
    ],
    beforePhotos: [],
    afterPhotos: [],
    report: {
      timeSpent: "45 minutes",
      materialsUsed: "New rainfall shower head, plumber's tape",
      cost: "$85.99",
      notes: "Replaced with upgraded rainfall shower head as requested",
    }
  },
];

export interface MaintenanceInstruction {
  id: number;
  title: string;
  completed: boolean;
}

export interface MaintenanceReport {
  timeSpent: string;
  materialsUsed: string;
  cost: string;
  notes: string;
}

export interface MaintenanceTask {
  id: number;
  title: string;
  property: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  description: string;
  location: string;
  requiredTools: string[];
  instructions: MaintenanceInstruction[];
  beforePhotos: string[];
  afterPhotos: string[];
  report?: MaintenanceReport;
}

export const useMaintenanceTasks = () => {
  const [tasks] = useState<MaintenanceTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<MaintenanceReport>({
    timeSpent: "",
    materialsUsed: "",
    cost: "",
    notes: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed");

    const matchesProperty = 
      propertyFilter === "all" || task.property === propertyFilter;

    const matchesPriority = 
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesTab && matchesProperty && matchesPriority;
  });

  const handleOpenTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      toast.success(`Task "${selectedTask.title}" marked as complete!`);
      handleCloseTask();
    }
  };

  const handleToggleInstruction = (itemId: number) => {
    if (selectedTask) {
      const updatedInstructions = selectedTask.instructions.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      
      setSelectedTask({
        ...selectedTask,
        instructions: updatedInstructions,
      });
    }
  };

  const handleCreateTask = (data: any) => {
    const requiredTools = data.requiredTools 
      ? data.requiredTools.split(',').map((item: string) => item.trim()).filter((item: string) => item)
      : [];
      
    toast.success(`Maintenance task "${data.title}" created successfully!`);
    setIsCreateTaskOpen(false);
  };

  const handlePhotoUpload = (file: File, type: 'before' | 'after') => {
    console.log(`${type} photo uploaded:`, file.name);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded for task!`);
  };

  const handleSubmitReport = (report: MaintenanceReport) => {
    setCurrentReport(report);
    toast.success("Maintenance report submitted successfully!");
    setIsReportOpen(false);
    handleCompleteTask();
  };

  return {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedTask,
    setSelectedTask,
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    propertyFilter,
    setPropertyFilter,
    priorityFilter,
    setPriorityFilter,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleToggleInstruction,
    handleCreateTask,
    handlePhotoUpload,
    isReportOpen,
    setIsReportOpen,
    handleSubmitReport,
    currentReport,
  };
};
