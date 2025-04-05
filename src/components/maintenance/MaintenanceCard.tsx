
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Calendar, AlertTriangle } from "lucide-react";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";

interface MaintenanceCardProps {
  task: MaintenanceTask;
  onClick: () => void;
}

const MaintenanceCard = ({ task, onClick }: MaintenanceCardProps) => {
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

  const priorityIcons = {
    High: <AlertTriangle className="h-4 w-4 mr-1" />,
    Medium: <AlertTriangle className="h-4 w-4 mr-1" />,
    Low: <AlertTriangle className="h-4 w-4 mr-1" />,
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
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{task.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{task.property} • {task.location}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(task.dueDate).toLocaleString("en-US", { 
                month: "short", 
                day: "numeric",
                hour: "numeric",
                minute: "2-digit" 
              })}
            </div>
            <Badge
              className={priorityColors[task.priority as keyof typeof priorityColors]}
            >
              {priorityIcons[task.priority as keyof typeof priorityIcons]}
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

export default MaintenanceCard;
