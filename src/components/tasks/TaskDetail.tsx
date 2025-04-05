
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BedDouble, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Task } from "@/types/taskTypes";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-blue-500" />
            <CardTitle>{task.title}</CardTitle>
          </div>
          <CardDescription>
            {task.property} • {task.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Task Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge variant={task.status === "Completed" ? "outline" : "default"}>
                  {task.status}
                </Badge>
                {task.approvalStatus && (
                  <Badge variant="outline" className={
                    task.approvalStatus === "Approved" ? "ml-2 bg-green-100 text-green-800 border-green-200" :
                    task.approvalStatus === "Rejected" ? "ml-2 bg-red-100 text-red-800 border-red-200" :
                    "ml-2 bg-yellow-100 text-yellow-800 border-yellow-200"
                  }>
                    {task.approvalStatus}
                  </Badge>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>{" "}
                <Badge
                  variant="outline"
                  className={
                    task.priority === "High"
                      ? "text-red-500 border-red-200"
                      : task.priority === "Medium"
                      ? "text-amber-500 border-amber-200"
                      : "text-blue-500 border-blue-200"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Due:</span>{" "}
                {new Date(task.dueDate).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="text-muted-foreground">Assignee:</span>{" "}
                {task.assignee}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Checklist</h3>
            <div className="space-y-2">
              {task.checklist.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={() => onToggleChecklistItem(item.id)}
                    disabled={task.status === "Completed"}
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className={`text-sm ${
                      item.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.title}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Photo Verification</h3>
            <div className="grid grid-cols-3 gap-2">
              {task.photos?.map((photo, index) => (
                <div key={index} className="bg-secondary rounded h-24 flex items-center justify-center overflow-hidden">
                  <img src={photo} alt={`Verification ${index + 1}`} className="object-cover w-full h-full" />
                </div>
              ))}
              {(!task.photos || task.photos.length < 3) && task.status !== "Completed" && (
                <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                  />
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </label>
              )}
              {Array.from({ length: Math.max(0, 2 - (task.photos?.length || 0)) }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-secondary rounded flex items-center justify-center h-24">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {task.approvalStatus === "Rejected" && task.rejectionReason && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-600">Rejection Reason</h3>
              <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-md border border-red-100">
                {task.rejectionReason}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2">
          <Button variant="outline" onClick={onClose} size={isMobile ? "sm" : "default"}>
            Close
          </Button>
          <div className="flex gap-2">
            {/* Staff can complete tasks */}
            {task.status !== "Completed" && !isManager && (
              <Button
                onClick={onComplete}
                disabled={!task.checklist.every((item) => item.completed) || !(task.photos?.length >= 1)}
                size={isMobile ? "sm" : "default"}
              >
                Mark as Complete
              </Button>
            )}

            {/* Managers can approve/reject completed tasks */}
            {isManager && task.status === "Completed" && task.approvalStatus !== "Approved" && (
              <>
                <Button
                  variant="destructive"
                  onClick={onReject}
                  size={isMobile ? "sm" : "default"}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={onApprove}
                  className="bg-green-600 hover:bg-green-700"
                  size={isMobile ? "sm" : "default"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskDetail;
