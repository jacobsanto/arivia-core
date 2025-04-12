
import React from 'react';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { CombinedTask } from './agendaUtils';
import TaskGroup from './TaskGroup';

interface AgendaContentProps {
  selectedDate: Date;
  sortedTasks: CombinedTask[];
  morningTasks: CombinedTask[];
  afternoonTasks: CombinedTask[];
  eveningTasks: CombinedTask[];
  onTaskClick: (task: CombinedTask) => void;
  swipeDirection: number;
}

// Animation variants for day transitions
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export const AgendaContent: React.FC<AgendaContentProps> = ({
  selectedDate,
  sortedTasks,
  morningTasks,
  afternoonTasks,
  eveningTasks,
  onTaskClick,
  swipeDirection
}) => {
  return (
    <motion.div
      key={selectedDate.toISOString()}
      custom={swipeDirection}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        type: "tween",
        duration: 0.3
      }}
    >
      {sortedTasks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No tasks scheduled for {format(selectedDate, 'MMMM d')}
        </div>
      ) : (
        <div className="space-y-3">
          <TaskGroup
            title="Morning"
            tasks={morningTasks}
            onTaskClick={onTaskClick}
          />
          
          <TaskGroup
            title="Afternoon"
            tasks={afternoonTasks}
            onTaskClick={onTaskClick}
          />
          
          <TaskGroup
            title="Evening"
            tasks={eveningTasks}
            onTaskClick={onTaskClick}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AgendaContent;
