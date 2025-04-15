
import { useState } from "react";
import { Task, TaskStatus, ApprovalStatus } from "@/types/taskTypes";
import { toastService } from "@/services/toast";

export const useTaskBasicActions = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
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
            status: "Completed" as TaskStatus,
            approvalStatus: "Pending" as ApprovalStatus
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask({
        ...selectedTask,
        status: "Completed" as TaskStatus,
        approvalStatus: "Pending" as ApprovalStatus
      });
      
      toastService.success(`Task "${selectedTask.title}" marked as complete and awaiting approval!`);
    }
  };

  return {
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask
  };
};
