
import { useState } from "react";
import { Task } from "../types/taskTypes";
import { initialTasks } from "../data/taskData";
import { filterTasks } from "../utils/taskFilters";
import { useTaskActions } from "./useTaskActions";
import { ChecklistTemplate } from "@/types/checklistTypes";

export type { Task, ChecklistItem } from "../types/taskTypes";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks as Task[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Get filtered tasks
  const filteredTasks = filterTasks(tasks, searchQuery, activeTab, propertyFilter, typeFilter);

  // Get task action handlers
  const {
    selectedTemplate,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleApproveTask,
    handleRejectTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload,
    handleSelectTemplate
  } = useTaskActions(tasks, setTasks, selectedTask, setSelectedTask);

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
    selectedTemplate,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleApproveTask,
    handleRejectTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload,
    handleSelectTemplate
  };
};
