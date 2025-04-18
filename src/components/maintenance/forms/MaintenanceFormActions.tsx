
import React from "react";
import { Button } from "@/components/ui/button";

interface MaintenanceFormActionsProps {
  onCancel: () => void;
}

const MaintenanceFormActions = ({ onCancel }: MaintenanceFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        Create Task
      </Button>
    </div>
  );
};

export default MaintenanceFormActions;
