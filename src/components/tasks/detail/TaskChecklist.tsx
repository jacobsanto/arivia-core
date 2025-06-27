
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistItem } from "@/types/taskTypes";

interface TaskChecklistProps {
  checklist: ChecklistItem[];
  onToggle: (itemId: string) => void;
  disabled: boolean;
}

const TaskChecklist = ({ checklist, onToggle, disabled }: TaskChecklistProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Checklist</h3>
      <div className="space-y-2">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={`item-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => onToggle(item.id)}
              disabled={disabled}
            />
            <label
              htmlFor={`item-${item.id}`}
              className={`text-sm ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.title || item.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskChecklist;
