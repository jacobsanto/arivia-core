
import React from "react";
import { Task } from "@/types/housekeepingTypes";
import HousekeepingColumn from "./HousekeepingColumn";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface HousekeepingKanbanProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAssignTask: (taskId: string, staffMember: string) => Promise<void>;
  cleaningDefinitions: Record<string, string>;
}

const HousekeepingKanban: React.FC<HousekeepingKanbanProps> = ({
  tasks,
  onStatusChange,
  onAssignTask,
  cleaningDefinitions,
}) => {
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="min-h-[500px] bg-muted/10 rounded-md border"
    >
      <ResizablePanel defaultSize={33}>
        <HousekeepingColumn 
          title="Pending" 
          status="pending" 
          tasks={pendingTasks} 
          onStatusChange={onStatusChange} 
          onAssignTask={onAssignTask}
          cleaningDefinitions={cleaningDefinitions}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={33}>
        <HousekeepingColumn 
          title="In Progress" 
          status="in-progress"
          tasks={inProgressTasks} 
          onStatusChange={onStatusChange} 
          onAssignTask={onAssignTask}
          cleaningDefinitions={cleaningDefinitions}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={33}>
        <HousekeepingColumn 
          title="Done" 
          status="done"
          tasks={doneTasks} 
          onStatusChange={onStatusChange} 
          onAssignTask={onAssignTask}
          cleaningDefinitions={cleaningDefinitions}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default HousekeepingKanban;
