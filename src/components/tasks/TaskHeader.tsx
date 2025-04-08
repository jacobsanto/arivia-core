
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BedDouble, BarChart } from "lucide-react";
import { useUser } from "@/contexts/auth/UserContext";

interface TaskHeaderProps {
  onCreateTask: () => void;
  onViewReports?: () => void;
}

const TaskHeader = ({ onCreateTask, onViewReports }: TaskHeaderProps) => {
  const { user } = useUser();
  const isManager = user?.role === "superadmin" || user?.role === "administrator" || user?.role === "property_manager";
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BedDouble className="mr-2 h-7 w-7" /> Housekeeping Tasks
        </h1>
        <p className="text-muted-foreground">
          Manage room cleaning, laundry, and guest turnover tasks.
        </p>
      </div>
      <div className="flex gap-2">
        {isManager && onViewReports && (
          <Button variant="outline" onClick={onViewReports}>
            <BarChart className="mr-2 h-4 w-4" />
            Reports
          </Button>
        )}
        <Button onClick={onCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
