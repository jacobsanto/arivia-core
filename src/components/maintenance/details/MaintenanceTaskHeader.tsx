
import React from "react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceTaskHeaderProps {
  title: string;
  property: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
}

const MaintenanceTaskHeader = ({
  title,
  property,
  status,
  priority,
  dueDate,
  assignee
}: MaintenanceTaskHeaderProps) => {
  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Task Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <Badge variant={status === "Completed" ? "outline" : "default"}>
              {status}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Priority:</span>{" "}
            <Badge
              variant="outline"
              className={
                priority === "High"
                  ? "text-red-500 border-red-200"
                  : priority === "Medium"
                  ? "text-amber-500 border-amber-200"
                  : "text-blue-500 border-blue-200"
              }
            >
              {priority}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Due:</span>{" "}
            {new Date(dueDate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div>
            <span className="text-muted-foreground">Assignee:</span>{" "}
            {assignee}
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenanceTaskHeader;
