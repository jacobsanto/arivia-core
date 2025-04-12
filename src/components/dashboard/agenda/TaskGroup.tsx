
import React from 'react';
import { CombinedTask } from './agendaUtils';
import AgendaTask from './AgendaTask';

interface TaskGroupProps {
  title: string;
  tasks: CombinedTask[];
  onTaskClick: (task: CombinedTask) => void;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({ title, tasks, onTaskClick }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground flex items-center my-1">
        {title}
        <div className="h-[1px] bg-border flex-1 ml-2"></div>
      </h4>
      {tasks.map(task => (
        <AgendaTask 
          key={`${task.taskType}-${task.id}`} 
          task={task} 
          onClick={() => onTaskClick(task)} 
        />
      ))}
    </div>
  );
};

export default TaskGroup;
