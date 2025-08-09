
import React from "react";
import { Task } from "@/types/taskTypes";
import { Badge } from "@/components/ui/badge";
import { Calendar, Home, User } from "lucide-react";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

const statusClass = (status: Task["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const GenericTaskListView: React.FC<Props> = ({ tasks, onOpenTask }) => {
  return (
    <div className="rounded-md border divide-y">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onOpenTask(task)}
          className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-foreground">{task.title}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-4 truncate">
                <span className="flex items-center"><Home className="h-4 w-4 mr-1" />{task.property}</span>
                <span className="flex items-center"><User className="h-4 w-4 mr-1" />{task.assignedTo}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}
              </div>
              <Badge className={statusClass(task.status)}>{task.status}</Badge>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default GenericTaskListView;
