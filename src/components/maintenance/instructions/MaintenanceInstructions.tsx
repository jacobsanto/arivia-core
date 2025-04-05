
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceInstruction } from "@/hooks/useMaintenanceTasks";

interface MaintenanceInstructionsProps {
  instructions: MaintenanceInstruction[];
  disabled?: boolean;
  onToggleInstruction?: (id: number) => void;
}

const MaintenanceInstructions = ({
  instructions,
  disabled = false,
  onToggleInstruction
}: MaintenanceInstructionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Instructions</h3>
      <div className="space-y-2">
        {instructions.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={`item-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => onToggleInstruction && onToggleInstruction(item.id)}
              disabled={disabled}
            />
            <label
              htmlFor={`item-${item.id}`}
              className={`text-sm ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.title}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceInstructions;
