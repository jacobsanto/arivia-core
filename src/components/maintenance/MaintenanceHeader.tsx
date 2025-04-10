
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";

interface MaintenanceHeaderProps {
  onCreateTask: () => void;
}

const MaintenanceHeader = ({ onCreateTask }: MaintenanceHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
          <Wrench className="mr-2 h-7 w-7" /> Maintenance Tasks
        </h1>
        <p className="text-sm text-muted-foreground tracking-tight">
          Manage property repairs, systems checks, and equipment maintenance.
        </p>
      </div>
      <Button onClick={onCreateTask}>
        <Plus className="mr-2 h-4 w-4" />
        <span className="font-medium">Create Maintenance Task</span>
      </Button>
    </div>
  );
};

export default MaintenanceHeader;
