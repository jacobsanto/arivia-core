
import React from "react";
import { Wrench } from "lucide-react";

interface MaintenanceToolsProps {
  requiredTools: string[];
}

const MaintenanceTools = ({ requiredTools }: MaintenanceToolsProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        Required Tools/Parts
      </h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
        {requiredTools.map((tool, index) => (
          <li key={index}>{tool}</li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceTools;
