
import React from 'react';
import { format } from 'date-fns';
import { CombinedTask } from './agendaUtils';
import AgendaTask from './AgendaTask';

interface TaskGroupProps {
  date: Date;
  tasks: CombinedTask[];
  onTaskClick?: (task: CombinedTask) => void;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({ date, tasks, onTaskClick }) => {
  return (
    <div className="mb-6">
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b mb-3 pb-2">
        <h3 className="text-lg font-semibold text-foreground">
          {format(date, 'EEEE, MMMM d')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <AgendaTask 
            key={task.id} 
            task={task} 
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
};
