
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChecklistTemplate } from '@/types/checklistTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UseTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ChecklistTemplate | null;
}

const UseTemplateDialog: React.FC<UseTemplateDialogProps> = ({
  isOpen,
  onOpenChange,
  template
}) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Use Template: {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description:</p>
            <p>{template.description}</p>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline">{template.category}</Badge>
            <Badge variant="outline">{template.items.length} items</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Checklist Items:</p>
            <ul className="space-y-1">
              {template.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {item.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Here you would implement the logic to use the template
              console.log('Using template:', template);
              onOpenChange(false);
            }}>
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UseTemplateDialog;
