
import { useState } from "react";
import { initialTasks } from "../data/maintenanceTasks";
import { MaintenanceReport, MaintenanceTask } from "../types/maintenanceTypes";
import { 
  completeTask, 
  toggleInstruction, 
  submitReport, 
  uploadPhoto, 
  createMaintenanceTask 
} from "../utils/maintenanceUtils";
import { filterMaintenanceTasks } from "../utils/maintenanceFilters";

export type { MaintenanceInstruction, MaintenanceReport, MaintenanceTask } from "../types/maintenanceTypes";

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

  const filteredTasks = filterMaintenanceTasks(
    tasks,
    searchQuery,
    activeTab,
    propertyFilter,
    priorityFilter
  );

  const handleOpenTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      completeTask(selectedTask);
      handleCloseTask();
    }
  };

  const handleToggleInstruction = (itemId: number) => {
    if (selectedTask) {
      setSelectedTask(toggleInstruction(selectedTask, itemId));
    }
  };

  const handleCreateTask = (data: any) => {
    createMaintenanceTask(data);
    setIsCreateTaskOpen(false);
  };

  const handlePhotoUpload = (file: File, type: 'before' | 'after') => {
    uploadPhoto(file, type);
  };

  const handleSubmitReport = (report: MaintenanceReport) => {
    setCurrentReport(report);
    submitReport(report);
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
