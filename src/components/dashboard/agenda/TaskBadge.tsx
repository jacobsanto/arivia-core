
import React from 'react';
import { Badge } from "@/components/ui/badge";

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
  // Determine badge style based on priority
  const getPriorityStyle = () => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (priorityLower === 'medium') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };
  
  // Determine badge style based on task type
  const getTypeStyle = () => {
    if (taskType === 'maintenance') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };
  
  // Which badge to show?
  if (showPriorityBadge) {
    return (
      <Badge variant="outline" className={getPriorityStyle()}>
        {priority}
      </Badge>
    );
  }
  
  // Show task type badge by default
  return (
    <Badge variant="outline" className={getTypeStyle()}>
      {taskType === 'housekeeping' ? 'Cleaning' : 'Maintenance'}
    </Badge>
  );
};

export default TaskBadge;
