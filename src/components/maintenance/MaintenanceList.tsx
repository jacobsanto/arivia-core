
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MaintenanceCard from "@/components/maintenance/MaintenanceCard";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";

interface MaintenanceListProps {
  tasks: MaintenanceTask[];
  onOpenTask: (task: MaintenanceTask) => void;
}

const MaintenanceList = ({ tasks, onOpenTask }: MaintenanceListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardHeader>
          <CardTitle>No maintenance tasks found</CardTitle>
          <CardDescription>
            Try adjusting your filters or create a new maintenance task.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task) => (
        <MaintenanceCard key={task.id} task={task} onClick={() => onOpenTask(task)} />
      ))}
    </div>
  );
};

export default MaintenanceList;
