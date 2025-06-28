
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChecklistTemplateForm from "@/components/admin/checklists/ChecklistTemplateForm";
import { ChecklistTemplate, ChecklistTemplateFormValues } from "@/types/checklistTypes";

interface TemplateFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  template?: ChecklistTemplate;
  onSubmit: (data: ChecklistTemplateFormValues) => void;
}

const TemplateFormDialog = ({
  isOpen,
  onOpenChange,
  title,
  template,
  onSubmit,
}: TemplateFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ChecklistTemplateForm
          template={template}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TemplateFormDialog;
