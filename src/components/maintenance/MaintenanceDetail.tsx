
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Image } from "lucide-react";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";

// Import the new components
import MaintenanceTaskHeader from "./details/MaintenanceTaskHeader";
import MaintenanceDescription from "./details/MaintenanceDescription";
import MaintenanceLocation from "./details/MaintenanceLocation";
import MaintenanceTools from "./details/MaintenanceTools";
import MaintenanceInstructions from "./instructions/MaintenanceInstructions";
import MaintenancePhotoUpload from "./photos/MaintenancePhotoUpload";

interface MaintenanceDetailProps {
  task: MaintenanceTask | null;
  onClose: () => void;
  onComplete: () => void;
  onPhotoUpload?: (file: File, type: 'before' | 'after') => void;
  onToggleInstruction?: (id: number) => void;
}

const MaintenanceDetail = ({
  task,
  onClose,
  onComplete,
  onPhotoUpload,
  onToggleInstruction,
}: MaintenanceDetailProps) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>
            {task.property} • Maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MaintenanceTaskHeader
            title={task.title}
            property={task.property}
            status={task.status}
            priority={task.priority}
            dueDate={task.dueDate}
            assignee={task.assignee}
          />

          <MaintenanceDescription description={task.description} />
          <MaintenanceLocation location={task.location} />
          <MaintenanceTools requiredTools={task.requiredTools} />

          <MaintenanceInstructions 
            instructions={task.instructions} 
            disabled={task.status === "Completed"} 
            onToggleInstruction={onToggleInstruction}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Before Photos
            </h3>
            <MaintenancePhotoUpload 
              type="before" 
              onPhotoUpload={onPhotoUpload} 
              disabled={task.status === "Completed"} 
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              After Photos
            </h3>
            <MaintenancePhotoUpload 
              type="after" 
              onPhotoUpload={onPhotoUpload} 
              disabled={task.status === "Completed"} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onComplete}
            disabled={task.status === "Completed" || !task.instructions.every((item) => item.completed)}
          >
            {task.status === "Completed" ? "Completed" : "Submit Report"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MaintenanceDetail;
