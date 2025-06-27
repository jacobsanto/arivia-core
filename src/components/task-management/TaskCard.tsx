
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { Task } from '@/types/task-management';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onComplete, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {task.description}
          </p>
        )}
        
        <div className="space-y-2">
          {task.dueDate && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
              <Clock className="h-4 w-4" />
              <span>Due: {formatDate(task.dueDate)}</span>
              {isOverdue && <Badge variant="destructive" className="ml-auto">Overdue</Badge>}
            </div>
          )}
          
          {task.propertyId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Property: {task.propertyId}</span>
            </div>
          )}
          
          {task.assigned_to && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned to: {task.assigned_to}</span>
            </div>
          )}
        </div>

        {task.checklist && task.checklist.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span>Checklist: {task.checklist.filter(item => item.completed).length}/{task.checklist.length} completed</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
              Edit
            </Button>
          )}
          {onComplete && task.status !== 'completed' && (
            <Button variant="default" size="sm" onClick={() => onComplete(task.id)}>
              Complete
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
