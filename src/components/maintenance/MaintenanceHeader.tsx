
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
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Tasks</h1>
        <p className="text-muted-foreground">
          Manage property repairs, systems checks, and equipment maintenance.
        </p>
      </div>
      <Button onClick={onCreateTask}>
        <Plus className="mr-2 h-4 w-4" />
        Create Maintenance Task
      </Button>
    </div>
  );
};

export default MaintenanceHeader;
