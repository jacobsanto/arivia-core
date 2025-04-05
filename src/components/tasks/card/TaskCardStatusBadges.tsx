
import React from "react";
import { Badge } from "@/components/ui/badge";

interface TaskCardStatusBadgesProps {
  status: string;
  priority: string;
  approvalStatus: "Approved" | "Rejected" | "Pending" | null;
  isMobile: boolean;
  dueDate: string;
}

export const TaskCardStatusBadges = ({
  status,
  priority,
  approvalStatus,
  isMobile,
  dueDate
}: TaskCardStatusBadgesProps) => {
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

  return (
    <div className={`flex ${isMobile ? 'flex-wrap gap-1' : 'items-center space-x-2'}`}>
      <span className="text-sm text-muted-foreground">
        Due: {new Date(dueDate).toLocaleString("en-US", { 
          month: "short", 
          day: "numeric",
          hour: "numeric",
          minute: "2-digit" 
        })}
      </span>
      <Badge
        className={priorityColors[priority as keyof typeof priorityColors]}
      >
        {priority}
      </Badge>
      <Badge
        className={statusColors[status as keyof typeof statusColors]}
      >
        {status}
      </Badge>
      {approvalStatus && (
        <Badge
          variant="outline"
          className={
            approvalStatus === "Approved" ? "border-green-200 text-green-800 bg-green-50" :
            approvalStatus === "Rejected" ? "border-red-200 text-red-800 bg-red-50" :
            "border-yellow-200 text-yellow-800 bg-yellow-50"
          }
        >
          {approvalStatus}
        </Badge>
      )}
    </div>
  );
};
