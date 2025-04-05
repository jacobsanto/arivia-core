
import React from "react";

interface MaintenanceDescriptionProps {
  description: string;
}

const MaintenanceDescription = ({ description }: MaintenanceDescriptionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Description</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default MaintenanceDescription;
