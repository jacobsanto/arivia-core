
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChecklistTemplateForm from "./ChecklistTemplateForm";
import { ChecklistTemplateFormValues } from "@/types/checklistTemplates";

interface ChecklistTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ChecklistTemplateFormValues) => void;
  initialData?: Partial<ChecklistTemplateFormValues>;
  title: string;
}

const ChecklistTemplateDialog: React.FC<ChecklistTemplateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ChecklistTemplateForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistTemplateDialog;
