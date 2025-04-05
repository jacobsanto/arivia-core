
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/hooks/useTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const isMobile = useIsMobile();

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
  
  const approvalIcon = task.approvalStatus === "Approved" ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : task.approvalStatus === "Rejected" ? (
    <XCircle className="h-4 w-4 text-red-600" />
  ) : task.approvalStatus === "Pending" ? (
    <Clock className="h-4 w-4 text-yellow-600" />
  ) : null;

  return (
    <Card
      className="hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row justify-between items-center'}`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{task.title}</h3>
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-800"
              >
                Housekeeping
              </Badge>
              {approvalIcon}
            </div>
            <p className="text-sm text-muted-foreground">{task.property}</p>
          </div>
          <div className={`flex ${isMobile ? 'flex-wrap gap-1' : 'items-center space-x-2'}`}>
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
            {task.approvalStatus && (
              <Badge
                variant="outline"
                className={
                  task.approvalStatus === "Approved" ? "border-green-200 text-green-800 bg-green-50" :
                  task.approvalStatus === "Rejected" ? "border-red-200 text-red-800 bg-red-50" :
                  "border-yellow-200 text-yellow-800 bg-yellow-50"
                }
              >
                {task.approvalStatus}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
