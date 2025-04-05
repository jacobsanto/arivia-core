
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Task } from "@/types/taskTypes";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Import smaller components
import TaskDetailHeader from "./detail/TaskDetailHeader";
import TaskBasicInfo from "./detail/TaskBasicInfo";
import TaskDescription from "./detail/TaskDescription";
import TaskChecklist from "./detail/TaskChecklist";
import TaskPhotos from "./detail/TaskPhotos";
import TaskRejectionReason from "./detail/TaskRejectionReason";
import TaskActions from "./detail/TaskActions";

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  onComplete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onToggleChecklistItem: (itemId: number) => void;
  onPhotoUpload?: (file: File) => void;
}

const TaskDetail = ({
  task,
  onClose,
  onComplete,
  onApprove,
  onReject,
  onToggleChecklistItem,
  onPhotoUpload,
}: TaskDetailProps) => {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const isManager = user?.role === "superadmin" || user?.role === "administrator" || user?.role === "property_manager";
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onPhotoUpload) {
        onPhotoUpload(e.target.files[0]);
        toast.success("Photo uploaded successfully");
      }
    }
  };

  if (!task) return null;

  // Check if the task can be completed
  const canCompleteTask = task.checklist.every((item) => item.completed) && 
                         (task.photos?.length ?? 0) >= 1;

  // For mobile version, we don't need the overlay as we're using Sheet
  const containerClasses = isMobile 
    ? "" 
    : "fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4";

  const cardClasses = isMobile
    ? "w-full border-0"
    : "w-full max-w-2xl max-h-[80vh] overflow-auto";

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader>
          <TaskDetailHeader task={task} />
        </CardHeader>
        <CardContent className="space-y-6">
          <TaskBasicInfo task={task} />
          <TaskDescription description={task.description} />
          <TaskChecklist 
            checklist={task.checklist}
            onToggle={onToggleChecklistItem}
            disabled={task.status === "Completed"}
          />
          <TaskPhotos 
            photos={task.photos}
            onPhotoUpload={handlePhotoUpload}
            disabled={task.status === "Completed"}
          />
          {task.approvalStatus === "Rejected" && (
            <TaskRejectionReason reason={task.rejectionReason} />
          )}
        </CardContent>
        <CardFooter>
          <TaskActions
            onClose={onClose}
            onComplete={onComplete}
            onApprove={onApprove}
            onReject={onReject}
            status={task.status}
            approvalStatus={task.approvalStatus}
            isManager={isManager}
            canComplete={canCompleteTask}
            isMobile={isMobile}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskDetail;
