
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BedDouble } from "lucide-react";

interface TaskHeaderProps {
  onCreateTask: () => void;
}

const TaskHeader = ({ onCreateTask }: TaskHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Housekeeping Tasks</h1>
        <p className="text-muted-foreground">
          Manage room cleaning, laundry, and guest turnover tasks.
        </p>
      </div>
      <Button onClick={onCreateTask}>
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
    </div>
  );
};

export default TaskHeader;
