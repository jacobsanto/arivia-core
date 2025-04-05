
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/taskTypes";

interface TaskBasicInfoProps {
  task: Task;
}

const TaskBasicInfo = ({ task }: TaskBasicInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Task Details</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Status:</span>{" "}
          <Badge variant={task.status === "Completed" ? "outline" : "default"}>
            {task.status}
          </Badge>
          {task.approvalStatus && (
            <Badge variant="outline" className={
              task.approvalStatus === "Approved" ? "ml-2 bg-green-100 text-green-800 border-green-200" :
              task.approvalStatus === "Rejected" ? "ml-2 bg-red-100 text-red-800 border-red-200" :
              "ml-2 bg-yellow-100 text-yellow-800 border-yellow-200"
            }>
              {task.approvalStatus}
            </Badge>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Priority:</span>{" "}
          <Badge
            variant="outline"
            className={
              task.priority === "High"
                ? "text-red-500 border-red-200"
                : task.priority === "Medium"
                ? "text-amber-500 border-amber-200"
                : "text-blue-500 border-blue-200"
            }
          >
            {task.priority}
          </Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Due:</span>{" "}
          {new Date(task.dueDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div>
          <span className="text-muted-foreground">Assignee:</span>{" "}
          {task.assignee}
        </div>
      </div>
    </div>
  );
};

export default TaskBasicInfo;
