
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
import { Plus, Image, Tool, MapPin } from "lucide-react";
import { toast } from "sonner";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";

interface MaintenanceDetailProps {
  task: MaintenanceTask | null;
  onClose: () => void;
  onComplete: () => void;
  onPhotoUpload?: (file: File, type: 'before' | 'after') => void;
}

const MaintenanceDetail = ({
  task,
  onClose,
  onComplete,
  onPhotoUpload,
}: MaintenanceDetailProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (e.target.files && e.target.files[0]) {
      if (onPhotoUpload) {
        onPhotoUpload(e.target.files[0], type);
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
            {task.property} • Maintenance
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

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-sm text-muted-foreground">
              {task.location}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Tool className="h-4 w-4" />
              Required Tools/Parts
            </h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              {task.requiredTools.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Instructions</h3>
            <div className="space-y-2">
              {task.instructions.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={() => {}}
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
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Before Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handlePhotoUpload(e, 'before')}
                  disabled={task.status === "Completed"}
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

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              After Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="bg-secondary rounded flex items-center justify-center h-24 cursor-pointer hover:bg-secondary/80 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handlePhotoUpload(e, 'after')}
                  disabled={task.status === "Completed"}
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
