
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import MaintenanceCreationForm from "@/components/maintenance/forms/MaintenanceCreationForm";
import { BedDouble, Wrench } from "lucide-react";

interface TaskCreationDialogsProps {
  isCleaningDialogOpen: boolean;
  setIsCleaningDialogOpen: (value: boolean) => void;
  isMaintenanceDialogOpen: boolean;
  setIsMaintenanceDialogOpen: (value: boolean) => void;
  onCleaningTaskCreate: (data: any) => void;
  onMaintenanceTaskCreate: (data: any) => void;
}

const TaskCreationDialogs: React.FC<TaskCreationDialogsProps> = ({
  isCleaningDialogOpen,
  setIsCleaningDialogOpen,
  isMaintenanceDialogOpen,
  setIsMaintenanceDialogOpen,
  onCleaningTaskCreate,
  onMaintenanceTaskCreate
}) => {
  const handleCleaningDialogClose = () => {
    setIsCleaningDialogOpen(false);
  };

  const handleMaintenanceDialogClose = () => {
    setIsMaintenanceDialogOpen(false);
  };

  return (
    <>
      {/* Cleaning Task Dialog */}
      <Dialog open={isCleaningDialogOpen} onOpenChange={setIsCleaningDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BedDouble className="h-5 w-5 mr-2 text-blue-500" />
              Create Cleaning Task
            </DialogTitle>
          </DialogHeader>
          <TaskCreationForm 
            onSubmit={onCleaningTaskCreate} 
            onCancel={handleCleaningDialogClose} 
          />
        </DialogContent>
      </Dialog>

      {/* Maintenance Task Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-amber-500" />
              Create Maintenance Task
            </DialogTitle>
          </DialogHeader>
          <MaintenanceCreationForm 
            onSubmit={onMaintenanceTaskCreate} 
            onCancel={handleMaintenanceDialogClose} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCreationDialogs;
