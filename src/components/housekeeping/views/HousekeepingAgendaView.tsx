
import React from "react";
import { Task } from "@/types/housekeepingTypes";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
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

const HousekeepingAgendaView: React.FC<Props> = ({ tasks }) => {
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.due_date ? format(new Date(t.due_date), "yyyy-MM-dd") : "No date";
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
              <div key={task.id} className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {statusBadge(task.status)}
                    <div className="truncate">
                      <div className="font-medium truncate">{task.task_type}</div>
                      <div className="text-sm text-muted-foreground truncate">{task.listing_id}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{task.due_date ? format(new Date(task.due_date), "p") : "--"}</div>
                  <div className="flex items-center"><User className="h-4 w-4 mr-1" />{task.assigned_to || "Unassigned"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HousekeepingAgendaView;
