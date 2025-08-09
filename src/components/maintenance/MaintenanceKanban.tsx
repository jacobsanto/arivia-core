import React from "react";
import MaintenanceCard from "@/components/maintenance/MaintenanceCard";
import { Badge } from "@/components/ui/badge";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";

interface MaintenanceKanbanProps {
  tasks: MaintenanceTask[];
  onOpenTask: (task: MaintenanceTask) => void;
}

const normalize = (s: string) => s?.toLowerCase?.() || "";

const inGroup = (status: string, group: "pending" | "inprogress" | "done") => {
  const s = normalize(status);
  const groups: Record<string, string[]> = {
    pending: ["pending", "open", "to do", "to-do", "todo"],
    inprogress: ["in progress", "in-progress", "progress", "working"],
    done: ["completed", "done", "closed", "resolved"],
  };
  return groups[group].some((g) => s === g);
};

const Column: React.FC<{ title: string; items: MaintenanceTask[]; onOpenTask: (t: MaintenanceTask) => void }> = ({ title, items, onOpenTask }) => (
  <div className="flex flex-col h-full border rounded-md bg-background">
    <div className="p-3 border-b flex items-center justify-between">
      <h3 className="font-medium">{title}</h3>
      <Badge variant="outline" className="text-xs">{items.length}</Badge>
    </div>
    <div className="flex-1 p-3 space-y-3 overflow-auto min-h-[320px]">
      {items.length === 0 ? (
        <div className="flex justify-center items-center h-28 text-muted-foreground text-sm border border-dashed rounded-md">
          No tasks
        </div>
      ) : (
        items.map((task) => (
          <MaintenanceCard key={task.id} task={task} onClick={() => onOpenTask(task)} />
        ))
      )}
    </div>
  </div>
);

const MaintenanceKanban: React.FC<MaintenanceKanbanProps> = ({ tasks, onOpenTask }) => {
  const pending = tasks.filter((t) => inGroup(t.status, "pending"));
  const inProgress = tasks.filter((t) => inGroup(t.status, "inprogress"));
  const done = tasks.filter((t) => inGroup(t.status, "done"));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[500px]">
      <Column title="Pending" items={pending} onOpenTask={onOpenTask} />
      <Column title="In Progress" items={inProgress} onOpenTask={onOpenTask} />
      <Column title="Done" items={done} onOpenTask={onOpenTask} />
    </div>
  );
};

export default MaintenanceKanban;
