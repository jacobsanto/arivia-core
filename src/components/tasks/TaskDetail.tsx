
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskDetailProps {
  task: {
    id: number;
    title: string;
    property: string;
    type: string;
    status: string;
    priority: string;
    dueDate: string;
    assignee: string;
    description: string;
    checklist: ChecklistItem[];
  } | null;
  onClose: () => void;
  onComplete: () => void;
  onToggleChecklistItem: (itemId: number) => void;
  onPhotoUpload?: (file: File) => void;
}

const TaskDetail = ({
  task,
  onClose,
  onComplete,
  onToggleChecklistItem,
  onPhotoUpload,
}: TaskDetailProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onPhotoUpload) {
        onPhotoUpload(e.target.files[0]);
        toast.success("Photo uploaded successfully");
      }
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
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
              <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
                <Plus className="h-6 w-6 text-muted-foreground" />
              </label>
              <div className="bg-secondary rounded flex items-center justify-center h-24">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="bg-secondary rounded flex items-center justify-center h-24">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onComplete}
            disabled={!task.checklist.every((item) => item.completed)}
          >
            Mark as Complete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskDetail;
