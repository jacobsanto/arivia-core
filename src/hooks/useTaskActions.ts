import { useState } from "react";
import { toastService } from "@/services/toast";
import { Task } from "../types/taskTypes";
import { getCleaningChecklist } from "@/utils/cleaningChecklists";

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
      
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ));
    }
  };

  const handleCreateTask = (data: any) => {
    // Extract cleaning-specific data
    const { cleaningDetails, checklist, ...taskData } = data;
    
    // Create the base task
    const newTask = {
      ...taskData,
      type: "Housekeeping",
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      status: "Pending",
      approvalStatus: null,
      rejectionReason: null,
      photos: [],
      // Use provided checklist if available, otherwise generate one based on cleaning type
      checklist: checklist || getCleaningChecklist(data.cleaningType || "Standard"),
    };
    
    // Add cleaning details if provided
    if (cleaningDetails) {
      newTask.cleaningDetails = cleaningDetails;
    }
    
    setTasks([...tasks, newTask]);
    toastService.success(`Housekeeping task "${data.title}" created successfully!`);
    
    // If this is a multi-cleaning schedule, create the additional tasks
    if (cleaningDetails && cleaningDetails.scheduledCleanings && cleaningDetails.scheduledCleanings.length > 1) {
      // Skip first and last cleanings (check-in and check-out) as the main task covers one of them
      for (let i = 1; i < cleaningDetails.scheduledCleanings.length - 1; i++) {
        const cleaningDate = new Date(cleaningDetails.scheduledCleanings[i]);
        const cleaningType = i % 2 === 1 ? "Linen & Towel Change" : "Full";
        
        const additionalTask = {
          ...taskData,
          title: `${cleaningType} - ${data.property}`,
          type: "Housekeeping",
          id: Math.max(...tasks.map(t => t.id), 0) + 1 + i,
          status: "Pending",
          approvalStatus: null,
          rejectionReason: null,
          photos: [],
          dueDate: cleaningDate,
          checklist: getCleaningChecklist(cleaningType),
          cleaningDetails: {
            ...cleaningDetails,
            cleaningType
          }
        };
        
        setTasks(prevTasks => [...prevTasks, additionalTask]);
      }
      
      toastService.success(`${cleaningDetails.scheduledCleanings.length - 1} additional cleaning tasks were created for the stay duration.`);
    }
  };

  const handlePhotoUpload = (file: File) => {
    if (!selectedTask) return;
    
    const photoUrl = URL.createObjectURL(file);
    
    const updatedPhotos = selectedTask.photos ? [...selectedTask.photos, photoUrl] : [photoUrl];
    
    const updatedTask = {
      ...selectedTask,
      photos: updatedPhotos
    };
    
    setSelectedTask(updatedTask);
    
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
