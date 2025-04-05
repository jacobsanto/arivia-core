
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
    approvalStatus: null,
    rejectionReason: null,
    photos: [],
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
    approvalStatus: null,
    rejectionReason: null,
    photos: [],
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
    approvalStatus: "Approved",
    rejectionReason: null,
    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ],
    checklist: [
      { id: 1, title: "Deep clean carpets", completed: true },
      { id: 2, title: "Clean windows inside and out", completed: true },
      { id: 3, title: "Clean behind furniture", completed: true },
      { id: 4, title: "Clean air vents", completed: true },
      { id: 5, title: "Pressure wash outdoor areas", completed: true },
    ],
  },
  {
    id: 5,
    title: "Villa Paradiso Room Turnover",
    property: "Villa Paradiso",
    type: "Housekeeping",
    status: "Completed",
    priority: "High",
    dueDate: "2025-04-02T16:00:00",
    assignee: "Ana Rodriguez",
    description: "Prepare rooms for new guests arriving at 18:00",
    approvalStatus: "Pending",
    rejectionReason: null,
    photos: [
      "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    checklist: [
      { id: 1, title: "Clean all rooms", completed: true },
      { id: 2, title: "Replace bedding", completed: true },
      { id: 3, title: "Stock toiletries", completed: true },
      { id: 4, title: "Vacuum and dust", completed: true },
    ],
  },
  {
    id: 6,
    title: "Villa Azure Post-Event Cleanup",
    property: "Villa Azure",
    type: "Housekeeping",
    status: "Completed",
    priority: "Medium",
    dueDate: "2025-04-01T09:00:00",
    assignee: "Thomas Lindberg",
    description: "Clean villa after corporate retreat event",
    approvalStatus: "Rejected",
    rejectionReason: "Stains on living room carpet still visible, broken glass found under the sofa",
    photos: [
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ],
    checklist: [
      { id: 1, title: "Remove event decorations", completed: true },
      { id: 2, title: "Clean dining and meeting areas", completed: true },
      { id: 3, title: "Clean and tidy all rooms", completed: true },
      { id: 4, title: "Restore furniture arrangement", completed: true },
      { id: 5, title: "Check for damages", completed: false },
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
  approvalStatus: "Approved" | "Rejected" | "Pending" | null;
  rejectionReason: string | null;
  photos?: string[];
  checklist: ChecklistItem[];
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "Pending") ||
      (activeTab === "inProgress" && task.status === "In Progress") ||
      (activeTab === "completed" && task.status === "Completed") ||
      (activeTab === "needsApproval" && task.status === "Completed" && task.approvalStatus === "Pending");

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
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task, 
            status: "Completed",
            approvalStatus: "Pending"
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask({
        ...selectedTask,
        status: "Completed",
        approvalStatus: "Pending"
      });
      
      toast.success(`Task "${selectedTask.title}" marked as complete and awaiting approval!`);
    }
  };

  const handleApproveTask = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task, 
            approvalStatus: "Approved"
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask({
        ...selectedTask,
        approvalStatus: "Approved"
      });
      
      toast.success(`Task "${selectedTask.title}" has been approved!`);
    }
  };

  const handleRejectTask = () => {
    if (selectedTask) {
      // In a real app, you would show a dialog to collect rejection reason
      const rejectionReason = prompt("Please provide a reason for rejection:");
      
      if (rejectionReason) {
        const updatedTasks = tasks.map(task => {
          if (task.id === selectedTask.id) {
            return {
              ...task, 
              approvalStatus: "Rejected",
              rejectionReason: rejectionReason
            };
          }
          return task;
        });
        
        setTasks(updatedTasks);
        setSelectedTask({
          ...selectedTask,
          approvalStatus: "Rejected",
          rejectionReason: rejectionReason
        });
        
        toast.error(`Task "${selectedTask.title}" has been rejected.`);
      }
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
      
      const updatedTask = {
        ...selectedTask,
        checklist: updatedChecklist,
      };

      setSelectedTask(updatedTask);
      
      // Update in the main tasks array as well
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ));
    }
  };

  const handleCreateTask = (data: any) => {
    data.type = "Housekeeping";
    data.id = Math.max(...tasks.map(t => t.id)) + 1;
    data.status = "Pending";
    data.approvalStatus = null;
    data.rejectionReason = null;
    data.photos = [];
    
    setTasks([...tasks, data]);
    toast.success(`Housekeeping task "${data.title}" created successfully!`);
    setIsCreateTaskOpen(false);
  };

  const handlePhotoUpload = (file: File) => {
    if (!selectedTask) return;
    
    // In a real app, we would upload the file to a server and get a URL
    // Here we're just creating a temporary URL
    const photoUrl = URL.createObjectURL(file);
    
    const updatedPhotos = selectedTask.photos ? [...selectedTask.photos, photoUrl] : [photoUrl];
    
    // Update selected task
    const updatedTask = {
      ...selectedTask,
      photos: updatedPhotos
    };
    
    setSelectedTask(updatedTask);
    
    // Update in the main tasks array as well
    setTasks(tasks.map(task => 
      task.id === selectedTask.id ? updatedTask : task
    ));
    
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
    isReportingOpen,
    setIsReportingOpen,
    propertyFilter,
    setPropertyFilter,
    typeFilter,
    setTypeFilter,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleApproveTask,
    handleRejectTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload,
  };
};
