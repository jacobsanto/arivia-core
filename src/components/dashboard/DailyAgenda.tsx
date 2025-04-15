import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { addDays } from 'date-fns';
import { Task } from '@/types/taskTypes';
import { MaintenanceTask } from '@/types/maintenanceTypes';
import { useSwipe } from "@/hooks/use-swipe";
import { AnimatePresence } from "framer-motion";
import SwipeIndicators from "@/components/profile/SwipeIndicators";
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import AgendaHeader from './agenda/AgendaHeader';
import AgendaContent from './agenda/AgendaContent';
import { 
  CombinedTask,
  combineTasks, 
  filterTasksForSelectedDate, 
  sortTasksByTime,
  groupTasksByTimeOfDay
} from './agenda/agendaUtils';

interface DailyAgendaProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
}

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  housekeepingTasks,
  maintenanceTasks
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { showSwipeHint, isMobile: isMobileDevice, resetSwipeHint } = useSwipeHint();

  const combinedTasks: CombinedTask[] = combineTasks(housekeepingTasks, maintenanceTasks);
  const tasksForSelectedDate = filterTasksForSelectedDate(combinedTasks, selectedDate);
  const sortedTasks = sortTasksByTime(tasksForSelectedDate);
  const { morningTasks, afternoonTasks, eveningTasks } = groupTasksByTimeOfDay(sortedTasks);

  const { pullMoveY, isRefreshing, contentRef, handlers } = usePullToRefresh({
    onRefresh: () => {
      console.log("Refreshing tasks data...");
    }
  });

  const { onTouchStart: swipeTouchStart, onTouchMove: swipeTouchMove, onTouchEnd: swipeTouchEnd } = useSwipe({
    onSwipeLeft: () => navigateToDay('next'),
    onSwipeRight: () => navigateToDay('prev'),
  });

  const onTouchStart = (e: React.TouchEvent) => {
    handlers.onTouchStart(e);
    swipeTouchStart(e);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handlers.onTouchMove(e);
    swipeTouchMove(e);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    handlers.onTouchEnd();
    swipeTouchEnd(e);
  };

  const navigateToDay = (direction: 'next' | 'prev') => {
    setSelectedDate(prevDate => 
      direction === 'next' ? addDays(prevDate, 1) : addDays(prevDate, -1)
    );
    resetSwipeHint();
  };

  const handleTaskClick = (task: CombinedTask) => {
    console.log("Task clicked:", task.title);
  };

  const [swipeDirection, setSwipeDirection] = useState<number>(0);

  useEffect(() => {
    setSwipeDirection(1);
  }, [selectedDate]);

  return (
    <Card className="w-full overflow-hidden relative">
      <CardHeader className="pb-3">
        <AgendaHeader 
          selectedDate={selectedDate} 
          onNavigateDay={navigateToDay} 
        />
      </CardHeader>
      
      <div 
        className="relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {pullMoveY > 0 && (
          <div 
            className="absolute top-0 left-0 w-full flex justify-center items-center"
            style={{ height: `${Math.min(pullMoveY, 100)}px` }}
          >
            <div className={`transition-transform ${pullMoveY > 60 ? 'rotate-180' : ''}`}>
              <ChevronDown className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-xs ml-2">
              {pullMoveY > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
        
        <CardContent 
          ref={contentRef}
          className="px-3 overflow-y-auto max-h-[500px]"
          style={{ transform: pullMoveY > 0 ? `translateY(${pullMoveY}px)` : 'none' }}
        >
          <AnimatePresence initial={false} mode="wait" custom={swipeDirection}>
            <AgendaContent
              selectedDate={selectedDate}
              sortedTasks={sortedTasks}
              morningTasks={morningTasks}
              afternoonTasks={afternoonTasks}
              eveningTasks={eveningTasks}
              onTaskClick={handleTaskClick}
              swipeDirection={swipeDirection}
            />
          </AnimatePresence>
        </CardContent>
      </div>
      
      {isMobileDevice && (
        <SwipeIndicators
          hasPrevTab={true}
          hasNextTab={true}
          showSwipeHint={showSwipeHint}
        />
      )}
    </Card>
  );
};

export default DailyAgenda;
