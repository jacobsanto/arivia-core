
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Calendar } from 'lucide-react';
import { Task } from '@/types/task-management';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  showActions?: boolean;
  isStaffView?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
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

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onView,
  showActions = true,
  isStaffView = false
}) => {
  const canComplete = task.status !== 'completed' && task.status !== 'cancelled';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className={`${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} title={`Priority: ${task.priority}`} />
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {task.assigned_role && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{task.assigned_role}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          
          {task.property_id && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Property {task.property_id}</span>
            </div>
          )}
        </div>

        {task.metadata?.estimated_duration && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{task.metadata.estimated_duration} minutes</span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(task)}>
                View
              </Button>
            )}
            
            {!isStaffView && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
            )}
            
            {canComplete && onComplete && (
              <Button size="sm" onClick={() => onComplete(task.id)}>
                {task.status === 'open' ? 'Start' : 'Complete'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
