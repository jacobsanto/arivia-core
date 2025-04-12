import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import TaskDetail from "@/components/tasks/TaskDetail";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { toast } from "sonner";

interface CombinedTask {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  priority: string;
  property: string;
  taskType: "housekeeping" | "maintenance";
  status: string;
}

interface AgendaTaskProps {
  task: CombinedTask;
  onClick: () => void;
}

export const AgendaTask: React.FC<AgendaTaskProps> = ({ task, onClick }) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState<MaintenanceTask | null>(null);
  
  const taskTime = format(parseISO(task.dueDate), 'h:mm a');
  
  // Prioritize which badge to show on mobile - only show the most important one
  const showPriorityBadge = task.priority === "High" || task.priority === "high";
  
  const priorityStyles = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800",
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800"
  };

  const statusStyles = {
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Completed: "bg-green-100 text-green-800",
  };

  const typeStyles = {
    housekeeping: "bg-purple-100 text-purple-800 border-purple-200",
    maintenance: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  // Extract task name without villa name and "at"
  const getTaskNameWithoutVilla = () => {
    const villaName = task.property;
    let cleanTitle = task.title;
    
    // Remove property name if it appears in the title
    if (cleanTitle.includes(villaName)) {
      cleanTitle = cleanTitle.replace(`${villaName} `, '').replace(`${villaName}`, '');
    }
    
    // Remove "at" if it appears at the beginning of the title after cleanup
    cleanTitle = cleanTitle.trim();
    if (cleanTitle.toLowerCase().startsWith('at ')) {
      cleanTitle = cleanTitle.substring(3);
    }
    
    return cleanTitle.trim();
  };
  
  const handleTaskClick = async () => {
    // Instead of navigating, we'll fetch the task data and open a detail view
    try {
      // In a real implementation, we would fetch the full task data here
      // For now we'll simulate it with a simplified task object based on the combined task info
      if (task.taskType === "housekeeping") {
        // Create a mock Task object with the available information
        const housekeepingTask: Task = {
          id: task.id,
          title: task.title,
          property: task.property,
          type: task.type,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignee: "Assigned Staff", // This would come from the actual task data
          description: "Task details would be loaded here in a real implementation.",
          approvalStatus: "Pending",
          rejectionReason: null,
          photos: [],
          checklist: [
            { id: 1, title: "Sample checklist item 1", completed: false },
            { id: 2, title: "Sample checklist item 2", completed: false }
          ]
        };
        setSelectedTask(housekeepingTask);
      } else {
        // Create a mock MaintenanceTask object
        const maintenanceTask: MaintenanceTask = {
          id: task.id,
          title: task.title,
          property: task.property,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignee: "Maintenance Staff",
          description: "Maintenance task details would be loaded here in a real implementation.",
          location: "Location details",
          requiredTools: ["Tool 1", "Tool 2"],
          specialInstructions: "Special instructions would appear here",
          instructions: [
            { id: 1, title: "Sample instruction 1", completed: false },
            { id: 2, title: "Sample instruction 2", completed: false }
          ],
          beforePhotos: [],
          afterPhotos: [],
          beforeVideos: [],
          afterVideos: []
        };
        setSelectedMaintenanceTask(maintenanceTask);
      }
      setIsTaskDetailOpen(true);
    } catch (error) {
      console.error("Error loading task details:", error);
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

  return (
    <>
      <div 
        className="flex items-center p-2 rounded-md border hover:bg-secondary/50 active:bg-secondary cursor-pointer transition-colors"
        onClick={handleTaskClick}
      >
        <div className="min-w-[45px] text-2xs md:text-xs text-muted-foreground">
          {taskTime}
        </div>
        <div className="flex-1 ml-2 mr-1">
          <div className="font-medium text-sm line-clamp-1">{getTaskNameWithoutVilla()}</div>
          <div className="text-2xs md:text-xs text-muted-foreground line-clamp-1">{task.property}</div>
        </div>
        <div className="ml-auto">
          {showPriorityBadge ? (
            <Badge variant="outline" className={priorityStyles[task.priority as keyof typeof priorityStyles]}>
              {task.priority}
            </Badge>
          ) : (
            <Badge variant="outline" className={typeStyles[task.taskType]}>
              {task.taskType === "housekeeping" ? "HK" : "MT"}
            </Badge>
          )}
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
          onVideoUpload={handleMaintenanceMediaUpload}
        />
      )}
    </>
  );
};

export default AgendaTask;
