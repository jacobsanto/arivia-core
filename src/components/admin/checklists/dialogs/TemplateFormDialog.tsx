
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChecklistTemplate } from '@/types/checklistTypes';
import ChecklistTemplateForm from '../ChecklistTemplateForm';

interface TemplateFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => Promise<void>;
  template?: ChecklistTemplate | null;
  title?: string;
}

const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  template,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {title || (template ? 'Edit Template' : 'Create New Template')}
          </DialogTitle>
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
