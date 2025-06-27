
import React from 'react';
import { Task } from '@/types/task-management';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  showActions?: boolean;
  isStaffView?: boolean;
  emptyMessage?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onEdit,
  onView,
  showActions = true,
  isStaffView = false,
  emptyMessage = "No tasks found"
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onView={onView}
          showActions={showActions}
          isStaffView={isStaffView}
        />
      ))}
    </div>
  );
};

export default TaskList;
