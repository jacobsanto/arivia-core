
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceInstructionList from "./details/MaintenanceInstructionList";
import MaintenanceTaskHeader from "./details/MaintenanceTaskHeader";
import MaintenanceMediaUpload from "./media/MaintenanceMediaUpload";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MaintenanceDetailProps {
  task: MaintenanceTask;
  onClose: () => void;
  onComplete: () => void;
  onPhotoUpload?: (file: File, type: 'before' | 'after') => void;
  onVideoUpload?: (file: File, type: 'before' | 'after') => void;
  onToggleInstruction: (itemId: number) => void;
}

const MaintenanceDetail = ({
  task,
  onClose,
  onComplete,
  onPhotoUpload,
  onVideoUpload,
  onToggleInstruction,
}: MaintenanceDetailProps) => {
  const [activeTab, setActiveTab] = React.useState("details");
  const isMobile = useIsMobile();

  const isCompleted = task.status === "Completed";
  const allInstructionsCompleted = task.instructions.every((item) => item.completed);
  const canComplete = allInstructionsCompleted && task.status !== "Completed";

  const content = (
    <>
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-bold">{task.title}</h2>
        <p className="text-sm text-muted-foreground">{task.property}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="instructions">
            <span>Instructions</span>
          </TabsTrigger>
          <TabsTrigger value="media">
            <span>Media</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="space-y-4">
            <MaintenanceTaskHeader
              title={task.title}
              property={task.property}
              status={task.status}
              priority={task.priority}
              dueDate={task.dueDate}
              assignee={task.assignee}
            />

            {task.description && (
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm">{task.description}</p>
              </div>
            )}

            {task.location && (
              <div>
                <h3 className="text-sm font-medium mb-1">Location</h3>
                <p className="text-sm">{task.location}</p>
              </div>
            )}

            {task.requiredTools && task.requiredTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Required Tools</h3>
                <ul className="list-disc pl-5 text-sm">
                  {task.requiredTools.map((tool, index) => (
                    <li key={index}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.specialInstructions && (
              <div>
                <h3 className="text-sm font-medium mb-1">Special Instructions</h3>
                <p className="text-sm">{task.specialInstructions}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="instructions">
          <MaintenanceInstructionList
            instructions={task.instructions}
            onToggle={onToggleInstruction}
            disabled={isCompleted}
          />
        </TabsContent>

        <TabsContent value="media">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Before Photos/Videos</h3>
              <MaintenanceMediaUpload
                type="before"
                onPhotoUpload={onPhotoUpload}
                onVideoUpload={onVideoUpload}
                disabled={isCompleted}
                photos={task.beforePhotos}
                videos={task.beforeVideos}
              />
            </div>

            {(isCompleted || task.afterPhotos.length > 0 || task.afterVideos.length > 0) && (
              <div>
                <h3 className="text-sm font-medium mb-2">After Photos/Videos</h3>
                <MaintenanceMediaUpload
                  type="after"
                  onPhotoUpload={onPhotoUpload}
                  onVideoUpload={onVideoUpload}
                  disabled={isCompleted}
                  photos={task.afterPhotos}
                  videos={task.afterVideos}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onClose}>
          <span>Close</span>
        </Button>
        {canComplete && (
          <Button onClick={onComplete} disabled={!canComplete}>
            <span>Complete & Submit Report</span>
          </Button>
        )}
      </div>
    </>
  );

  // Use a Sheet component for mobile and Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={!!task} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] pt-6 overflow-y-auto">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maintenance Task</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceDetail;
