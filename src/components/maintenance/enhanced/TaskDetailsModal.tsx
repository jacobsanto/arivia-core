import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceTaskEnhanced } from "@/types/maintenance-enhanced.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { 
  Calendar, 
  User, 
  MapPin, 
  DollarSign, 
  Clock, 
  Camera, 
  MessageSquare,
  CheckSquare,
  Package,
  AlertTriangle,
  Wrench,
  X
} from "lucide-react";

interface TaskDetailsModalProps {
  task: MaintenanceTaskEnhanced | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (taskId: string, status: string) => void;
  onChecklistToggle?: (taskId: string, checklistId: number) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onChecklistToggle
}) => {
  const [newComment, setNewComment] = useState("");
  const isMobile = useIsMobile();

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'on_hold': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      console.log('Adding comment:', newComment);
      setNewComment("");
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold leading-tight">{task.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline">
            {task.taskType.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{task.property.name}</p>
                {task.location && (
                  <p className="text-xs text-muted-foreground">{task.location}</p>
                )}
              </div>
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{task.assignee.name}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee.role}</p>
                </div>
              </div>
            )}

            {/* Scheduled Date */}
            {task.scheduledDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.scheduledDate), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            )}

            {/* Estimated Cost */}
            {task.estimatedCost && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-xs text-muted-foreground">
                    €{task.estimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Duration */}
            {task.estimatedDuration && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(task.estimatedDuration / 60)}h {task.estimatedDuration % 60}m
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Required Tools */}
          {task.requiredTools.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Required Tools</h4>
              <div className="flex flex-wrap gap-1">
                {task.requiredTools.map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {task.safetyNotes && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Safety Notes</h4>
                  <p className="text-sm text-yellow-700">{task.safetyNotes}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-3">
          {task.checklist.length > 0 ? (
            task.checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <button
                  onClick={() => onChecklistToggle?.(task.id, item.id)}
                  className={`mt-0.5 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                  )}
                  {item.completedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Completed {format(new Date(item.completedAt), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No checklist items for this task
            </p>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {task.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Task photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {photo.type}
                    </Badge>
                    {photo.caption && (
                      <p className="text-xs text-muted-foreground mt-1">{photo.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No photos uploaded</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
            />
            <Button onClick={handleAddComment} size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {task.comments.length > 0 ? (
              task.comments.map((comment) => (
                <div key={comment.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {comment.userName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] pt-6 overflow-y-auto">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maintenance Task Details</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;