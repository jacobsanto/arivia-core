
import React from "react";
import { MapPin } from "lucide-react";

interface MaintenanceLocationProps {
  location: string;
}

const MaintenanceLocation = ({ location }: MaintenanceLocationProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Location
      </h3>
      <p className="text-sm text-muted-foreground">
        {location}
      </p>
    </div>
  );
};

export default MaintenanceLocation;
