
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    property: string;
    type: string;
    status: string;
    priority: string;
    dueDate: string;
    assignee: string;
  };
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const statusColors = {
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800",
  };

  const typeColors = {
    Housekeeping: "border-blue-200 text-blue-800",
    Maintenance: "border-amber-200 text-amber-800",
    Inventory: "border-purple-200 text-purple-800",
  };

  return (
    <Card
      className="hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{task.title}</h3>
              <Badge
                variant="outline"
                className={typeColors[task.type as keyof typeof typeColors]}
              >
                {task.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{task.property}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleString("en-US", { 
                month: "short", 
                day: "numeric",
                hour: "numeric",
                minute: "2-digit" 
              })}
            </span>
            <Badge
              className={priorityColors[task.priority as keyof typeof priorityColors]}
            >
              {task.priority}
            </Badge>
            <Badge
              className={statusColors[task.status as keyof typeof statusColors]}
            >
              {task.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
