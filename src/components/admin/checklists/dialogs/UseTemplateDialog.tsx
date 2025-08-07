import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChecklistTemplate } from "@/types/checklistTypes";
interface UseTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: ChecklistTemplate | null;
}
const UseTemplateDialog = ({
  isOpen,
  onOpenChange,
  selectedTemplate
}: UseTemplateDialogProps) => {
  const navigate = useNavigate();
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Use Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Choose which task type to create using the "{selectedTemplate?.name}" template:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" onClick={() => {
            navigate('/housekeeping');
            onOpenChange(false);
            toast.success("Template selected. Create a new housekeeping task to use it.");
          }}>
              <span className="text-lg mb-2">Housekeeping Task</span>
              <span className="text-xs text-muted-foreground text-center"> Create with this checklist</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" onClick={() => {
            navigate('/maintenance');
            onOpenChange(false);
            toast.success("Template selected. Create a new maintenance task to use it.");
          }}>
              <span className="text-lg mb-2">Maintenance Task</span>
              <span className="text-xs text-muted-foreground text-center">
                Create a maintenance task with this checklist
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default UseTemplateDialog;