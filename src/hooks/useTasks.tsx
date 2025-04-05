
import { useState } from "react";
import { toast } from "sonner";

// Sample task data
const initialTasks = [
  {
    id: 1,
    title: "Villa Caldera Cleaning",
    property: "Villa Caldera",
    type: "Housekeeping",
    status: "Pending",
    priority: "High",
    dueDate: "2025-04-04T14:00:00",
    assignee: "Maria Kowalska",
    description: "Complete full cleaning after guest checkout",
    checklist: [
      { id: 1, title: "Clean living room", completed: false },
      { id: 2, title: "Clean kitchen", completed: false },
      { id: 3, title: "Clean master bedroom", completed: false },
      { id: 4, title: "Clean guest bedrooms", completed: false },
      { id: 5, title: "Clean bathrooms", completed: false },
      { id: 6, title: "Clean outdoor areas", completed: false },
    ],
  },
  {
    id: 3,
    title: "Villa Sunset Laundry Service",
    property: "Villa Sunset",
    type: "Housekeeping",
    status: "Pending",
    priority: "Medium",
    dueDate: "2025-04-05T10:00:00",
    assignee: "Stefan Müller",
    description: "Change all bedding and towels",
    checklist: [
      { id: 1, title: "Change master bedroom linen", completed: false },
      { id: 2, title: "Change guest bedroom linen", completed: false },
      { id: 3, title: "Replace all bathroom towels", completed: false },
      { id: 4, title: "Replace kitchen towels", completed: false },
    ],
  },
  {
    id: 4,
    title: "Villa Oceana Deep Cleaning",
    property: "Villa Oceana",
    type: "Housekeeping",
    status: "Completed",
    priority: "Low",
    dueDate: "2025-04-03T13:00:00",
    assignee: "Maria Kowalska",
    description: "Perform quarterly deep cleaning of all areas",
    checklist: [
      { id: 1, title: "Deep clean carpets", completed: true },
      { id: 2, title: "Clean windows inside and out", completed: true },
      { id: 3, title: "Clean behind furniture", completed: true },
      { id: 4, title: "Clean air vents", completed: true },
      { id: 5, title: "Pressure wash outdoor areas", completed: true },
    ],
  },
];

export interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  property: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  description: string;
  checklist: ChecklistItem[];
}

export const useTasks = () => {
  const [tasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

    const matchesType = task.type === "Housekeeping";

    return matchesSearch && matchesTab && matchesProperty && matchesType;
  });

  const handleOpenTask = (task: Task) => {
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

  const handleToggleChecklistItem = (itemId: number) => {
    if (selectedTask) {
      const updatedChecklist = selectedTask.checklist.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      
      setSelectedTask({
        ...selectedTask,
        checklist: updatedChecklist,
      });
    }
  };

  const handleCreateTask = (data: any) => {
    data.type = "Housekeeping";
    toast.success(`Housekeeping task "${data.title}" created successfully!`);
    setIsCreateTaskOpen(false);
  };

  const handlePhotoUpload = (file: File) => {
    console.log("Photo uploaded:", file.name);
    toast.success(`Photo verification uploaded for task!`);
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
    typeFilter,
    setTypeFilter,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload,
  };
};
