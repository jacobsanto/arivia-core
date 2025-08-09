
import React from "react";
import { Task } from "@/types/taskTypes";
import { Badge } from "@/components/ui/badge";
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

const GenericTaskAgendaView: React.FC<Props> = ({ tasks, onOpenTask }) => {
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.dueDate ? format(new Date(t.dueDate), "yyyy-MM-dd") : "No date";
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  const orderedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {orderedDates.map((dateKey) => (
        <div key={dateKey}>
          <div className="mb-2 font-semibold text-foreground">
            {dateKey === "No date" ? "No date" : format(new Date(dateKey), "EEEE, MMM d")}
          </div>
          <div className="rounded-md border divide-y">
            {grouped[dateKey].map((task) => (
              <button
                key={task.id}
                onClick={() => onOpenTask(task)}
                className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{task.property} • {task.assignedTo}</div>
                  </div>
                  <Badge className={statusClass(task.status)}>{task.status}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenericTaskAgendaView;
