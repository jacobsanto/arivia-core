import React from 'react';
import { MaintenanceAgendaGroup, MaintenanceTaskEnhanced } from '@/types/maintenance-enhanced.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { 
  AlertTriangle, 
  Calendar, 
  Clock,
  Search,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskAgendaViewProps {
  groups: MaintenanceAgendaGroup[];
  onTaskClick: (task: MaintenanceTaskEnhanced) => void;
  onStatusChange?: (taskId: string, status: MaintenanceTaskEnhanced['status']) => void;
  onAssignTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  searchQuery?: string;
  className?: string;
}

export const TaskAgendaView: React.FC<TaskAgendaViewProps> = ({
  groups,
  onTaskClick,
  onStatusChange,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  searchQuery,
  className,
}) => {
  const totalTasks = groups.reduce((sum, group) => sum + group.count, 0);

  if (totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              {searchQuery ? (
                <Search className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Calendar className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <CardTitle className="text-lg">
              {searchQuery ? 'No matching tasks found' : 'No scheduled tasks'}
            </CardTitle>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No tasks match your search for "${searchQuery}". Try adjusting your filters or search terms.`
                  : 'There are no maintenance tasks scheduled. Create a new task or schedule existing ones.'
                }
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getGroupIcon = (group: MaintenanceAgendaGroup) => {
    if (group.isOverdue) return AlertTriangle;
    if (group.isToday) return Clock;
    return Calendar;
  };

  const getGroupStyles = (group: MaintenanceAgendaGroup) => {
    if (group.isOverdue) {
      return {
        headerClass: 'bg-red-50 border-red-200',
        badgeClass: 'bg-red-100 text-red-800',
        iconClass: 'text-red-600',
      };
    }
    
    if (group.isToday) {
      return {
        headerClass: 'bg-orange-50 border-orange-200',
        badgeClass: 'bg-orange-100 text-orange-800',
        iconClass: 'text-orange-600',
      };
    }

    return {
      headerClass: 'bg-blue-50 border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-800',
      iconClass: 'text-blue-600',
    };
  };

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => {
        const GroupIcon = getGroupIcon(group);
        const styles = getGroupStyles(group);

        return (
          <Card key={group.key} className="overflow-hidden">
            <CardHeader 
              className={cn(
                "pb-3 border-b", 
                styles.headerClass
              )}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GroupIcon className={cn("h-5 w-5", styles.iconClass)} />
                  <span className="text-lg font-semibold">{group.title}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-sm", styles.badgeClass)}
                >
                  {group.count} task{group.count !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={onStatusChange ? (status) => onStatusChange(task.id, status) : undefined}
                    onAssign={onAssignTask ? () => onAssignTask(task.id) : undefined}
                    onEdit={onEditTask ? () => onEditTask(task.id) : undefined}
                    onDelete={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};