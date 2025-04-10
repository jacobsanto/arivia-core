
import React from "react";
import { BedDouble } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Task } from "@/types/taskTypes";

interface TaskDetailHeaderProps {
  task: Task;
}

const TaskDetailHeader = ({
  task
}: TaskDetailHeaderProps) => {
  return <div className="flex items-center gap-2">
      <BedDouble className="h-8 w-8 text-blue-500" />
      <div className="space-y-1">
        <CardTitle className="text-xl">{task.title}</CardTitle>
        <CardDescription>
          {task.type}
        </CardDescription>
      </div>
    </div>;
};

export default TaskDetailHeader;
