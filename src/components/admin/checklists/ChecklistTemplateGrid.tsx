
import React from "react";
import { ChecklistTemplate } from "@/types/checklistTypes";
import ChecklistTemplateCard from "./ChecklistTemplateCard";

interface ChecklistTemplateGridProps {
  templates: ChecklistTemplate[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUse: (id: string) => void;
}

const ChecklistTemplateGrid = ({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
}: ChecklistTemplateGridProps) => {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8">
        <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
        <p className="text-muted-foreground text-center mb-4">
          No checklist templates match your criteria. Try adjusting your filters or create a new template.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <ChecklistTemplateCard
          key={template.id}
          template={template}
          onEdit={() => onEdit(template.id)}
          onDelete={() => onDelete(template.id)}
          onDuplicate={() => onDuplicate(template.id)}
          onUse={() => onUse(template.id)}
        />
      ))}
    </div>
  );
};

export default ChecklistTemplateGrid;
