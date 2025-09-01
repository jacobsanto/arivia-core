import React from 'react';
import { MaintenanceTaskEnhanced } from '@/types/maintenance-enhanced.types';
import { TaskCard } from './TaskCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Search } from 'lucide-react';

interface TaskGridViewProps {
  tasks: MaintenanceTaskEnhanced[];
  onTaskClick: (task: MaintenanceTaskEnhanced) => void;
  onStatusChange?: (taskId: string, status: MaintenanceTaskEnhanced['status']) => void;
  onAssignTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  searchQuery?: string;
  className?: string;
}

export const TaskGridView: React.FC<TaskGridViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  searchQuery,
  className,
}) => {
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {tasks.map((task) => (
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
  );
};