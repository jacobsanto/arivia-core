import React from 'react';
import { MaintenanceTaskEnhanced, MaintenanceSort } from '@/types/maintenance-enhanced.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Camera,
  CheckSquare,
  Package,
  AlertTriangle,
  Clock,
  User,
  Search,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListViewProps {
  tasks: MaintenanceTaskEnhanced[];
  sort: MaintenanceSort;
  onSortChange: (sort: MaintenanceSort) => void;
  onTaskClick: (task: MaintenanceTaskEnhanced) => void;
  onStatusChange?: (taskId: string, status: MaintenanceTaskEnhanced['status']) => void;
  onAssignTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  searchQuery?: string;
  className?: string;
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'text-blue-600',
  normal: 'text-green-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

const taskTypeIcons = {
  repair: Wrench,
  inspection: ShieldCheck,
  routine_maintenance: Calendar,
  emergency: AlertTriangle,
  preventive: CheckSquare,
};

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  sort,
  onSortChange,
  onTaskClick,
  onStatusChange,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  searchQuery,
  className,
}) => {
  const handleSort = (field: MaintenanceSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction: newDirection });
  };

  const SortableHeader = ({ field, children, className: headerClassName }: {
    field: MaintenanceSort['field'];
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead 
      className={cn("cursor-pointer hover:bg-muted/50 select-none", headerClassName)}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sort.field === field && (
          sort.direction === 'asc' ? 
            <ChevronUp className="h-3 w-3" /> : 
            <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );

  const getDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const isOverdue = isPast(date);
    
    if (isOverdue) return { text: 'Overdue', className: 'text-red-600 font-medium' };
    if (isToday(date)) return { text: 'Today', className: 'text-orange-600 font-medium' };
    if (isTomorrow(date)) return { text: 'Tomorrow', className: 'text-blue-600' };
    
    return { 
      text: format(date, 'MMM d'), 
      className: 'text-muted-foreground' 
    };
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              {searchQuery ? (
                <Search className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Wrench className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <CardTitle className="text-lg">
              {searchQuery ? 'No matching tasks found' : 'No maintenance tasks'}
            </CardTitle>
            <CardDescription>
              {searchQuery 
                ? `No tasks match your search for "${searchQuery}". Try adjusting your filters or search terms.`
                : 'There are currently no maintenance tasks. Create your first maintenance task to get started.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <TooltipProvider>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <SortableHeader field="title">Task</SortableHeader>
              <SortableHeader field="property">Property</SortableHeader>
              <SortableHeader field="assignee">Assignee</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="priority">Priority</SortableHeader>
              <SortableHeader field="dueDate">Due Date</SortableHeader>
              <SortableHeader field="estimatedCost">Cost</SortableHeader>
              <TableHead>Details</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const TaskTypeIcon = taskTypeIcons[task.taskType];
              const dateStatus = getDateStatus(task.dueDate);
              const completedChecklist = task.checklist.filter(item => item.completed).length;
              const totalChecklist = task.checklist.length;

              return (
                <TableRow 
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTaskClick(task)}
                >
                  {/* Task */}
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-2">
                      <TaskTypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        {task.location && (
                          <div className="text-xs text-muted-foreground truncate">
                            {task.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Property */}
                  <TableCell>
                    <div className="font-medium">{task.property.name}</div>
                    {task.property.address && (
                      <div className="text-xs text-muted-foreground">
                        {task.property.address}
                      </div>
                    )}
                  </TableCell>

                  {/* Assignee */}
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {task.assignee.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {task.assignee.role}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", statusColors[task.status])}
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <div className={cn("font-medium capitalize", priorityColors[task.priority])}>
                      {task.priority}
                    </div>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    {dateStatus ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={dateStatus.className}>
                          {dateStatus.text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No date</span>
                    )}
                  </TableCell>

                  {/* Cost */}
                  <TableCell>
                    {(task.estimatedCost || task.actualCost) ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          ${task.actualCost || task.estimatedCost}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Details */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Checklist */}
                      {totalChecklist > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckSquare className="h-3 w-3" />
                              <span>{completedChecklist}/{totalChecklist}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Checklist progress: {completedChecklist} of {totalChecklist} completed
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Photos */}
                      {task.photos.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Camera className="h-3 w-3" />
                              <span>{task.photos.length}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {task.photos.length} photo{task.photos.length > 1 ? 's' : ''} attached
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Purchase Order */}
                      {task.purchaseOrderId && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Package className="h-3 w-3 text-blue-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Purchase Order: {task.purchaseOrderId}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Quality Control */}
                      {task.qcStatus && task.qcStatus !== 'not_required' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs px-1.5 py-0.5",
                                task.qcStatus === 'passed' && "border-green-200 text-green-700",
                                task.qcStatus === 'failed' && "border-red-200 text-red-700",
                                task.qcStatus === 'pending' && "border-yellow-200 text-yellow-700"
                              )}
                            >
                              QC
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Quality Control: {task.qcStatus}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
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
                              onStatusChange(task.id, 'in_progress');
                            }}>
                              Start Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(task.id, 'completed');
                            }}>
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {onAssignTask && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAssignTask(task.id);
                          }}>
                            <User className="h-4 w-4 mr-2" />
                            Reassign
                          </DropdownMenuItem>
                        )}
                        {onEditTask && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task.id);
                          }}>
                            Edit Task
                          </DropdownMenuItem>
                        )}
                        {onDeleteTask && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              className="text-red-600"
                            >
                              Delete Task
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};