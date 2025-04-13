
import { useState } from "react";
import { toastService } from "@/services/toast/toast.service";
import { Task } from "../types/taskTypes";

export const useTaskActions = (
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
            status: "Completed",
            approvalStatus: "Pending" as const
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
      
      toastService.success(`Task "${selectedTask.title}" marked as complete and awaiting approval!`);
    }
  };

  const handleApproveTask = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task, 
            approvalStatus: "Approved" as const
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask({
        ...selectedTask,
        approvalStatus: "Approved"
      });
      
      toastService.success(`Task "${selectedTask.title}" has been approved!`);
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
              approvalStatus: "Rejected" as const,
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
        
        toastService.error(`Task "${selectedTask.title}" has been rejected.`);
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
    toastService.success(`Housekeeping task "${data.title}" created successfully!`);
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
    
    toastService.success(`Photo verification uploaded for task!`);
  };

  return {
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
