import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Camera, 
  CheckSquare, 
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Package,
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { MaintenanceTaskEnhanced } from '@/types/maintenance-enhanced.types';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: MaintenanceTaskEnhanced;
  onClick: () => void;
  onStatusChange?: (status: MaintenanceTaskEnhanced['status']) => void;
  onAssign?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const priorityColors = {
  low: 'border-l-blue-500 bg-blue-50/50',
  normal: 'border-l-green-500 bg-green-50/50',
  high: 'border-l-orange-500 bg-orange-50/50',
  urgent: 'border-l-red-500 bg-red-50/50',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const taskTypeIcons = {
  repair: Wrench,
  inspection: ShieldCheck,
  routine_maintenance: Calendar,
  emergency: AlertTriangle,
  preventive: CheckSquare,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  onAssign,
  onEdit,
  onDelete,
  className,
}) => {
  const getDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && task.status !== 'completed';
    
    if (isOverdue) return { text: 'Overdue', className: 'text-red-600 font-medium' };
    if (isToday(dueDate)) return { text: 'Due Today', className: 'text-orange-600 font-medium' };
    if (isTomorrow(dueDate)) return { text: 'Due Tomorrow', className: 'text-blue-600' };
    
    return { 
      text: format(dueDate, 'MMM d'), 
      className: 'text-muted-foreground' 
    };
  };

  const dateStatus = getDateStatus();
  const TaskTypeIcon = taskTypeIcons[task.taskType];
  const completedChecklist = task.checklist.filter(item => item.completed).length;
  const totalChecklist = task.checklist.length;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
        priorityColors[task.priority],
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TaskTypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="font-medium text-sm leading-tight truncate">
              {task.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", statusColors[task.status])}
            >
              {task.status.replace('_', ' ')}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onStatusChange && (
                  <>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange('in_progress');
                    }}>
                      Start Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange('completed');
                    }}>
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onAssign && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onAssign();
                  }}>
                    <User className="h-4 w-4 mr-2" />
                    Reassign
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}>
                    Edit Task
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-red-600"
                    >
                      Delete Task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Property and Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{task.property.name}</span>
          {task.location && (
            <>
              <span>•</span>
              <span>{task.location}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Key Info Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Date */}
            {dateStatus && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={dateStatus.className}>
                  {dateStatus.text}
                </span>
              </div>
            )}

            {/* Cost */}
            {(task.estimatedCost || task.actualCost) && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>
                  ${task.actualCost || task.estimatedCost}
                </span>
              </div>
            )}
          </div>

          {/* Priority Indicator */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-1.5 py-0.5",
              task.priority === 'urgent' && "border-red-200 text-red-700",
              task.priority === 'high' && "border-orange-200 text-orange-700",
              task.priority === 'normal' && "border-green-200 text-green-700",
              task.priority === 'low' && "border-blue-200 text-blue-700"
            )}
          >
            {task.priority}
          </Badge>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {task.assignee.name}
            </span>
          </div>
        )}

        {/* Progress Indicators */}
        <div className="flex items-center gap-3 text-xs">
          {/* Checklist Progress */}
          {totalChecklist > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </div>
          )}

          {/* Photos */}
          {task.photos.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Camera className="h-3 w-3" />
              <span>{task.photos.length}</span>
            </div>
          )}

          {/* Purchase Order */}
          {task.purchaseOrderId && (
            <div className="flex items-center gap-1 text-blue-600">
              <Package className="h-3 w-3" />
              <span>PO</span>
            </div>
          )}

          {/* Quality Control */}
          {task.qcStatus && task.qcStatus !== 'not_required' && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-1.5 py-0.5",
                task.qcStatus === 'passed' && "border-green-200 text-green-700",
                task.qcStatus === 'failed' && "border-red-200 text-red-700",
                task.qcStatus === 'pending' && "border-yellow-200 text-yellow-700"
              )}
            >
              QC: {task.qcStatus}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 bg-background"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-background">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};