
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CleaningTaskFormValues } from "@/types/taskTypes";
import { MaintenanceFormValues } from "@/components/maintenance/forms/types";
import CleaningTaskForm from "@/components/tasks/forms/CleaningTaskForm";
import MaintenanceCreationForm from "@/components/maintenance/forms/MaintenanceCreationForm";

interface TaskCreationDialogsProps {
  isCleaningDialogOpen: boolean;
  setIsCleaningDialogOpen: (isOpen: boolean) => void;
  isMaintenanceDialogOpen: boolean;
  setIsMaintenanceDialogOpen: (isOpen: boolean) => void;
  onCleaningTaskCreate: (data: CleaningTaskFormValues) => void;
  onMaintenanceTaskCreate: (data: MaintenanceFormValues) => void;
}

const TaskCreationDialogs: React.FC<TaskCreationDialogsProps> = ({
  isCleaningDialogOpen,
  setIsCleaningDialogOpen,
  isMaintenanceDialogOpen,
  setIsMaintenanceDialogOpen,
  onCleaningTaskCreate,
  onMaintenanceTaskCreate
}) => {
  const handleCleaningTaskSubmit = (data: CleaningTaskFormValues) => {
    onCleaningTaskCreate(data);
    setIsCleaningDialogOpen(false);
  };

  const handleMaintenanceTaskSubmit = (data: MaintenanceFormValues) => {
    onMaintenanceTaskCreate(data);
    setIsMaintenanceDialogOpen(false);
  };

  return (
    <>
      {/* Cleaning Task Creation */}
      <Sheet open={isCleaningDialogOpen} onOpenChange={setIsCleaningDialogOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Cleaning Task</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CleaningTaskForm 
              onSubmit={handleCleaningTaskSubmit}
              onCancel={() => setIsCleaningDialogOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Maintenance Task Creation */}
      <Sheet open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Maintenance Task</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <MaintenanceCreationForm 
              onSubmit={handleMaintenanceTaskSubmit}
              onCancel={() => setIsMaintenanceDialogOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TaskCreationDialogs;
