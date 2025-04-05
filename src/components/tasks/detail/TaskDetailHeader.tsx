
import React from "react";
import { BedDouble } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Task } from "@/types/taskTypes";

interface TaskDetailHeaderProps {
  task: Task;
}

const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <BedDouble className="h-5 w-5 text-blue-500" />
      <div className="space-y-1">
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>
          {task.property} • {task.type}
        </CardDescription>
      </div>
    </div>
  );
};

export default TaskDetailHeader;
