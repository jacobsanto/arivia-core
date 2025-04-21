
import React from "react";
import { KanbanColumnProps } from "@/types/housekeepingTypes";
import HousekeepingTaskCard from "./HousekeepingTaskCard";
import { Badge } from "@/components/ui/badge";

const HousekeepingColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  status,
  onStatusChange,
  onAssignTask,
  cleaningDefinitions,
}) => {
  // Function to get background color based on status
  const getColumnHeaderColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-b-yellow-200';
      case 'in-progress':
        return 'bg-blue-50 border-b-blue-200';
      case 'done':
        return 'bg-green-50 border-b-green-200';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 border-b ${getColumnHeaderColor()}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 p-3 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground text-sm border border-dashed rounded-md">
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <HousekeepingTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onAssignTask={onAssignTask}
              cleaningDefinitions={cleaningDefinitions}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HousekeepingColumn;
