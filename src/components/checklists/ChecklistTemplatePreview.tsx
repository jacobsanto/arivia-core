
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistTemplate } from "@/types/checklistTemplates";

interface ChecklistTemplatePreviewProps {
  template: ChecklistTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: () => void;
  allowSelection?: boolean;
}

const ChecklistTemplatePreview: React.FC<ChecklistTemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  allowSelection = false,
}) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{template.title}</DialogTitle>
            <Badge variant={template.taskType === "Housekeeping" ? "default" : "secondary"}>
              {template.taskType}
            </Badge>
          </div>
          {template.description && (
            <DialogDescription>{template.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Checklist Items:</h3>
          
          <div className="space-y-2">
            {template.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox id={`item-${item.id}`} disabled />
                <label
                  htmlFor={`item-${item.id}`}
                  className="text-sm"
                >
                  {item.title}
                </label>
              </div>
            ))}
          </div>

          {allowSelection && (
            <div className="flex justify-end mt-4">
              <Button onClick={onUseTemplate}>
                Use This Template
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistTemplatePreview;
