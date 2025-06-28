import React, { useState } from 'react';
import { format } from 'date-fns';
import TaskDetail from "@/components/tasks/TaskDetail";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { toast } from "sonner";
import { CombinedTask } from "./agendaUtils";
import TaskBadge from "./TaskBadge";
import { getTaskNameWithoutVilla } from "./taskTitleUtils";
import { createMockHousekeepingTask, createMockMaintenanceTask } from "./mockTaskUtils";

interface AgendaTaskProps {
  task: CombinedTask;
  onClick: () => void;
}

export const AgendaTask: React.FC<AgendaTaskProps> = ({ task, onClick }) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState<MaintenanceTask | null>(null);
  
  const taskTime = typeof task.dueDate === 'string' 
    ? format(new Date(task.dueDate), 'h:mm a')
    : format(task.dueDate as Date, 'h:mm a');
  
  // Prioritize which badge to show on mobile - only show the most important one
  const showPriorityBadge = task.priority === "High" || task.priority === "high";
  
  // Handle task click to show the appropriate detail view
  const handleTaskClick = async () => {
    try {
      if (task.taskType === "housekeeping") {
        const housekeepingTask = createMockHousekeepingTask(task);
        setSelectedTask(housekeepingTask);
      } else {
        const maintenanceTask = createMockMaintenanceTask(task);
        setSelectedMaintenanceTask(maintenanceTask);
      }
      setIsTaskDetailOpen(true);
    } catch (error) {
      toast.error("Could not load task details");
    }
  };

  // Handle closing the task detail view
  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
    setSelectedMaintenanceTask(null);
  };
  
  // Mock handlers for task actions
  const handleCompleteTask = () => {
    toast.success("Task marked as complete");
    handleCloseTaskDetail();
  };
  
  const handleToggleChecklistItem = (itemId: number) => {
    // In a real implementation, this would update the checklist item state
    console.log("Toggle checklist item:", itemId);
  };
  
  const handlePhotoUpload = (file: File) => {
    // In a real implementation, this would upload the photo
    console.log("Photo uploaded:", file.name);
  };

  const handleToggleInstruction = (itemId: number) => {
    // In a real implementation, this would update the instruction state
    console.log("Toggle instruction:", itemId);
  };

  const handleMaintenanceMediaUpload = (file: File, type: 'before' | 'after') => {
    // In a real implementation, this would upload the media file
    console.log(`${type} photo uploaded:`, file.name);
  };

  // Extract clean task title
  const cleanTaskTitle = getTaskNameWithoutVilla(task.title, task.property);

  return (
    <>
      <div 
        className="flex items-center p-3 rounded-md border hover:bg-secondary/50 active:bg-secondary cursor-pointer transition-colors my-1"
        onClick={handleTaskClick}
        role="button"
        tabIndex={0}
        aria-label={`Task: ${cleanTaskTitle} at ${taskTime}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTaskClick();
          }
        }}
      >
        <div className="min-w-[50px] text-xs md:text-sm text-muted-foreground">
          {taskTime}
        </div>
        <div className="flex-1 ml-3 mr-2">
          <div className="font-medium text-sm md:text-base line-clamp-1">{cleanTaskTitle}</div>
          <div className="text-2xs md:text-xs text-muted-foreground line-clamp-1">{task.property}</div>
        </div>
        <div className="ml-auto">
          <TaskBadge 
            priority={task.priority} 
            taskType={task.taskType}
            showPriorityBadge={showPriorityBadge}
          />
        </div>
      </div>

      {/* Task Detail Modal for Housekeeping */}
      {isTaskDetailOpen && selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={handleCloseTaskDetail}
          onComplete={handleCompleteTask}
          onToggleChecklistItem={handleToggleChecklistItem}
          onPhotoUpload={handlePhotoUpload}
        />
      )}

      {/* Maintenance Detail Modal */}
      {isTaskDetailOpen && selectedMaintenanceTask && (
        <MaintenanceDetail
          task={selectedMaintenanceTask}
          onClose={handleCloseTaskDetail}
          onComplete={handleCompleteTask}
          onToggleInstruction={handleToggleInstruction}
          onPhotoUpload={handleMaintenanceMediaUpload}
        />
      )}
    </>
  );
};

export default AgendaTask;
