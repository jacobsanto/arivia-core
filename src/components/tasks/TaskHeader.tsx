import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BedDouble, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
interface TaskHeaderProps {
  onCreateTask: () => void;
  onViewReports?: () => void;
}
const TaskHeader = ({
  onCreateTask,
  onViewReports
}: TaskHeaderProps) => {
  const {
    user
  } = useAuth();
  const isManager = user?.role === "superadmin" || user?.role === "administrator" || user?.role === "property_manager";
  return <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="md:text-3xl font-bold tracking-tight flex items-center px-0 py-[19px] mx-0 text-xl">
          <BedDouble className="mr-2 h-7 w-7" /> Housekeeping Tasks
        </h1>
        <p className="text-muted-foreground tracking-tight text-xs">
          Manage room cleaning, laundry, and guest turnover tasks efficiently.
        </p>
      </div>
      <div className="flex gap-2">
        {isManager && onViewReports && <Button variant="outline" onClick={onViewReports}>
            <BarChart className="mr-2 h-4 w-4" />
            <span className="font-medium">Reports</span>
          </Button>}
        <Button onClick={onCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="font-medium">Create Task</span>
        </Button>
      </div>
    </div>;
};
export default TaskHeader;