
import { useState } from "react";
// No initial tasks - will be loaded from database
import { DateRangeFilter, MaintenanceReport, MaintenanceTask } from "../types/maintenanceTypes";
import { 
  completeTask, 
  toggleInstruction, 
  submitReport, 
  uploadPhoto,
  uploadVideo,
  createMaintenanceTask 
} from "../utils/maintenanceUtils";
import { filterMaintenanceTasks } from "../utils/maintenanceFilters";

export type { MaintenanceInstruction, MaintenanceReport, MaintenanceTask } from "../types/maintenanceTypes";

export const useMaintenanceTasks = () => {
  const [tasks] = useState<MaintenanceTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>({
    startDate: null,
    endDate: null,
  });
  const [isHistoryView, setIsHistoryView] = useState(false);
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
    priorityFilter,
    dateRangeFilter
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
  
  const handleVideoUpload = (file: File, type: 'before' | 'after') => {
    uploadVideo(file, type);
  };

  const handleSubmitReport = (report: MaintenanceReport) => {
    setCurrentReport(report);
    submitReport(report);
    setIsReportOpen(false);
    handleCompleteTask();
  };
  
  const setDateRange = (range: DateRangeFilter) => {
    setDateRangeFilter(range);
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
    dateRangeFilter,
    setDateRange,
    isHistoryView,
    setIsHistoryView,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleToggleInstruction,
    handleCreateTask,
    handlePhotoUpload,
    handleVideoUpload,
    isReportOpen,
    setIsReportOpen,
    handleSubmitReport,
    currentReport,
  };
};
