
import React from "react";
import { Task } from "@/types/housekeepingTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAssignTask: (taskId: string, staffMember: string) => Promise<void>;
}

const statusBadge = (status: Task["status"]) => {
  const cls =
    status === "done"
      ? "bg-green-100 text-green-800"
      : status === "in-progress"
      ? "bg-blue-100 text-blue-800"
      : "bg-yellow-100 text-yellow-800";
  return <Badge className={cls}>{status}</Badge>;
};

const HousekeepingListView: React.FC<Props> = ({ tasks, onStatusChange }) => {
  return (
    <div className="divide-y rounded-md border">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {statusBadge(task.status)}
              <div className="truncate">
                <div className="font-medium text-foreground truncate">{task.task_type}</div>
                <div className="text-sm text-muted-foreground truncate">{task.listing_id}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{task.due_date ? format(new Date(task.due_date), "MMM d") : "No date"}</div>
            <div className="flex items-center"><User className="h-4 w-4 mr-1" />{task.assigned_to || "Unassigned"}</div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {task.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange(task.id, "in-progress")}>Start</Button>
            )}
            {task.status === "in-progress" && (
              <Button size="sm" onClick={() => onStatusChange(task.id, "done")}>Complete</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HousekeepingListView;
