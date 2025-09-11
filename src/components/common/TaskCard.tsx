import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAnnouncements } from '@/utils/a11y';
import { logger } from '@/services/logger';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  location?: string;
  estimatedDuration?: number; // in minutes
  completedAt?: string;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onTaskClick?: (task: Task) => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onTaskClick,
  isSelected = false,
  showDetails = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);
  const { announce } = useAnnouncements();

  const statusConfig = {
    pending: {
      icon: Circle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Pending',
    },
    in_progress: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'In Progress',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Completed',
    },
    blocked: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Blocked',
    },
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const currentStatus = statusConfig[task.status];
  const currentPriority = priorityConfig[task.priority];
  const StatusIcon = currentStatus.icon;

  const handleStatusToggle = () => {
    if (!onStatusChange) return;

    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(task.id, nextStatus);
    
    announce(
      `Task "${task.title}" marked as ${nextStatus === 'completed' ? 'completed' : 'pending'}`,
      'polite'
    );
    
    logger.debug('Task status changed', { 
      taskId: task.id, 
      oldStatus: task.status, 
      newStatus: nextStatus 
    });
  };

  const handleCardClick = () => {
    onTaskClick?.(task);
    logger.debug('Task card clicked', { taskId: task.id });
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    
    announce(
      `Task details ${!isExpanded ? 'expanded' : 'collapsed'}`,
      'polite'
    );
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const dueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}
        ${className}
      `}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Status: ${currentStatus.label}. Priority: ${currentPriority.label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <div className="flex-shrink-0"
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusToggle();
              }}
              aria-label={`Mark task as ${task.status === 'completed' ? 'pending' : 'completed'}`}
            >
              <StatusIcon 
                className={`w-5 h-5 ${currentStatus.color}`}
                aria-hidden="true"
              />
            </Button>
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-medium text-sm leading-tight ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${currentPriority.color}`}
                >
                  {currentPriority.label}
                </Badge>
                
                {task.description && (
                  <div className="flex-shrink-0"
                    style={{ minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={handleExpandToggle}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} task details`}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" aria-hidden="true" />
                  <span>{task.assignee.name}</span>
                </div>
              )}
              
              {task.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  <span>{task.location}</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-medium' : dueSoon ? 'text-orange-600' : ''
                }`}>
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress for in-progress tasks */}
            {task.status === 'in_progress' && task.estimatedDuration && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(Math.random() * 100)}%</span>
                </div>
                <Progress value={Math.random() * 100} className="h-1" />
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && task.description && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
                
                {task.estimatedDuration && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    Estimated: {task.estimatedDuration} minutes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};