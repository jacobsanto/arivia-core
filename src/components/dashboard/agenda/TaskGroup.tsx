
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { CombinedTask } from './agendaUtils';
import { format } from 'date-fns';

interface TaskGroupProps {
  title: string;
  tasks: CombinedTask[];
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const TaskGroup: React.FC<TaskGroupProps> = ({ 
  title, 
  tasks, 
  badgeVariant = 'default' 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          {title}
          <Badge variant={badgeVariant}>{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No tasks scheduled</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{task.title}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(task.due_date), 'HH:mm')}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{task.property_id || 'No property'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{task.assigned_to || 'Unassigned'}</span>
                </div>
                
                <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                  <span className="font-medium">{task.priority}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TaskGroup;
