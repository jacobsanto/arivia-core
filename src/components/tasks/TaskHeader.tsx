
import React from "react";
import { toast } from "sonner";
import { MoreVertical, CheckCircle2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/types/taskTypes";
import { useUser } from "@/contexts/UserContext";

interface TaskHeaderProps {
  task: Task;
  onStatusUpdate: (newStatus: TaskStatus) => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onStatusUpdate }) => {
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const isManager = user?.role === "superadmin" || user?.role === "tenant_admin" || user?.role === "property_manager";

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onStatusUpdate(newStatus);
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{task.title}</h2>
      <div className="flex items-center space-x-2">
        {isManager && task.status !== "Completed" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "Approved" && (
                <DropdownMenuItem onClick={() => handleStatusChange("Approved")}>
                  Approve
                </DropdownMenuItem>
              )}
              {task.status !== "Rejected" && (
                <DropdownMenuItem onClick={() => handleStatusChange("Rejected")}>
                  Reject
                </DropdownMenuItem>
              )}
              {task.status !== "Completed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("Completed")}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {task.status === "Completed" && (
          <div className="flex items-center text-green-500">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Completed
          </div>
        )}
        {isUpdating && (
          <Loader2 className="h-5 w-5 animate-spin" />
        )}
      </div>
    </div>
  );
};

export default TaskHeader;
