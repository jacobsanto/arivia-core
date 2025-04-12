
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';

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

  return (
    <div 
      className="flex items-center p-2 rounded-md border hover:bg-secondary/50 active:bg-secondary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="min-w-[45px] text-2xs md:text-xs text-muted-foreground">
        {taskTime}
      </div>
      <div className="flex-1 ml-2 mr-1">
        <div className="font-medium text-sm line-clamp-1">{task.title}</div>
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
  );
};

export default AgendaTask;
