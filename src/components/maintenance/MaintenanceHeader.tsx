
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MaintenanceHeaderProps {
  onCreateTask: () => void;
  onViewReports?: () => void;
}

const MaintenanceHeader = ({ onCreateTask, onViewReports }: MaintenanceHeaderProps) => {
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
      <div className="flex flex-col sm:flex-row gap-2">
        {onViewReports && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onViewReports}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="font-medium">View Reports</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View maintenance statistics and analytics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="font-medium">Create Maintenance Task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new maintenance task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MaintenanceHeader;
