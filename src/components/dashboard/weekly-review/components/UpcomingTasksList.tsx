
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskRecord } from "@/utils/dashboard";

interface UpcomingTasksListProps {
  tasks: TaskRecord[];
}

export const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No upcoming tasks for this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="border rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="font-medium">{task.title}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "outline"}>
                {task.priority || 'low'}
              </Badge>
              <span className="text-xs">{task.location || 'General'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{task.due_date}</p>
            <p className="text-xs text-muted-foreground">{task.property_id || 'All properties'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
