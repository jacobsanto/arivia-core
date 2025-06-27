
import React from 'react';
import { format, startOfDay, isSameDay } from 'date-fns';
import { CombinedTask } from './agendaUtils';
import { TaskGroup } from './TaskGroup';

interface AgendaContentProps {
  tasks: CombinedTask[];
  onTaskClick?: (task: CombinedTask) => void;
}

export const AgendaContent: React.FC<AgendaContentProps> = ({ 
  tasks, 
  onTaskClick 
}) => {
  // Group tasks by date
  const groupedTasks = React.useMemo(() => {
    const groups: { [key: string]: CombinedTask[] } = {};
    
    tasks.forEach(task => {
      const dateKey = format(startOfDay(new Date(task.date)), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    
    return groups;
  }, [tasks]);

  const sortedDates = Object.keys(groupedTasks).sort();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tasks scheduled for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => (
        <TaskGroup
          key={dateKey}
          date={new Date(dateKey)}
          tasks={groupedTasks[dateKey]}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
