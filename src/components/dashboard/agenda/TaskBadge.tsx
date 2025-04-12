
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { priorityStyles, typeStyles } from './taskStyles';

interface TaskBadgeProps {
  priority: string;
  taskType: "housekeeping" | "maintenance";
  showPriorityBadge: boolean;
}

export const TaskBadge: React.FC<TaskBadgeProps> = ({ 
  priority, 
  taskType, 
  showPriorityBadge 
}) => {
  if (showPriorityBadge) {
    return (
      <Badge 
        variant="outline" 
        className={priorityStyles[priority as keyof typeof priorityStyles]}
      >
        {priority}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={typeStyles[taskType]}
    >
      {taskType === "housekeeping" ? "HK" : "MT"}
    </Badge>
  );
};

export default TaskBadge;
