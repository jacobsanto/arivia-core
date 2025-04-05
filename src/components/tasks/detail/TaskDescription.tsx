
import React from "react";
import { Task } from "@/types/taskTypes";

interface TaskDescriptionProps {
  description: string;
}

const TaskDescription = ({ description }: TaskDescriptionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Description</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default TaskDescription;
