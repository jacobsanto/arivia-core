
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceInstruction } from "@/types/maintenanceTypes";

interface MaintenanceInstructionListProps {
  instructions: MaintenanceInstruction[];
  onToggle?: (id: number) => void;
  disabled?: boolean;
}

const MaintenanceInstructionList: React.FC<MaintenanceInstructionListProps> = ({
  instructions,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Task Instructions</h3>
      <div className="space-y-2">
        {instructions.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={`instruction-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => onToggle && onToggle(item.id)}
              disabled={disabled}
            />
            <label
              htmlFor={`instruction-${item.id}`}
              className={`text-sm ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.title}
            </label>
          </div>
        ))}
      </div>
      
      {instructions.length === 0 && (
        <p className="text-sm text-muted-foreground">No instructions provided for this task.</p>
      )}
      
      {!disabled && instructions.filter(i => i.completed).length === instructions.length && instructions.length > 0 && (
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm mt-4">
          All instructions completed! You may now submit the task.
        </div>
      )}
    </div>
  );
};

export default MaintenanceInstructionList;
