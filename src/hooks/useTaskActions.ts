
import { useState } from "react";
import { Task } from "../types/taskTypes";
import { ChecklistTemplate } from "@/types/checklistTypes";
import { useTaskBasicActions } from "./task-actions/useTaskBasicActions";
import { useTaskApproval } from "./task-actions/useTaskApproval";
import { useTaskChecklist } from "./task-actions/useTaskChecklist";
import { useTaskMedia } from "./task-actions/useTaskMedia";
import { useTaskCreation } from "./task-actions/useTaskCreation";

export const useTaskActions = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  // Integrate smaller hooks
  const { handleOpenTask, handleCloseTask, handleCompleteTask } = useTaskBasicActions(
    tasks, setTasks, selectedTask, setSelectedTask
  );
  
  const { handleApproveTask, handleRejectTask } = useTaskApproval(
    tasks, setTasks, selectedTask, setSelectedTask
  );
  
  const { handleToggleChecklistItem } = useTaskChecklist(
    tasks, setTasks, selectedTask, setSelectedTask
  );
  
  const { handlePhotoUpload } = useTaskMedia(
    tasks, setTasks, selectedTask, setSelectedTask
  );
  
  const { selectedTemplate, handleCreateTask, handleSelectTemplate } = useTaskCreation(
    tasks, setTasks
  );

  // Return all actions from the combined hooks
  return {
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
