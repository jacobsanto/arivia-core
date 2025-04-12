import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/taskTypes';
import { MaintenanceTask } from '@/types/maintenanceTypes';
import { useSwipe } from "@/hooks/use-swipe";
import { motion, AnimatePresence } from "framer-motion";
import SwipeIndicators from "@/components/profile/SwipeIndicators";
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { 
  CombinedTask,
  combineTasks, 
  filterTasksForSelectedDate, 
  sortTasksByTime,
  groupTasksByTimeOfDay
} from './agenda/agendaUtils';
import TaskGroup from './agenda/TaskGroup';

interface DailyAgendaProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
}

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  housekeepingTasks,
  maintenanceTasks
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { showSwipeHint, isMobile: isMobileDevice, resetSwipeHint } = useSwipeHint();

  // Combine housekeeping and maintenance tasks
  const combinedTasks: CombinedTask[] = combineTasks(housekeepingTasks, maintenanceTasks);

  // Filter tasks for the selected date
  const tasksForSelectedDate = filterTasksForSelectedDate(combinedTasks, selectedDate);

  // Sort tasks by time
  const sortedTasks = sortTasksByTime(tasksForSelectedDate);

  // Group tasks by morning, afternoon, evening
  const { morningTasks, afternoonTasks, eveningTasks } = groupTasksByTimeOfDay(sortedTasks);

  // Handle pull-to-refresh functionality
  const { pullMoveY, isRefreshing, contentRef, handlers } = usePullToRefresh({
    onRefresh: () => {
      console.log("Refreshing tasks data...");
      // Here you would typically fetch fresh data
      // For this example, we're just using the mock refresh implementation from the hook
    }
  });

  // Swipe to change days
  const { onTouchStart: swipeTouchStart, onTouchMove: swipeTouchMove, onTouchEnd: swipeTouchEnd } = useSwipe({
    onSwipeLeft: () => navigateToDay('next'),
    onSwipeRight: () => navigateToDay('prev'),
  });
  
  // Combined touch handlers
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
    if (task.taskType === "housekeeping") {
      navigate(`/housekeeping?taskId=${task.id}`);
    } else {
      navigate(`/maintenance?taskId=${task.id}`);
    }
  };

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

  // Track swipe direction for animations
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  
  useEffect(() => {
    // Update swipe direction when date changes
    setSwipeDirection(1); // Default to forward direction
  }, [selectedDate]);

  return (
    <Card className="w-full overflow-hidden relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Daily Agenda
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateToDay('prev')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <div className="font-medium text-sm">
              {format(selectedDate, 'EEEE, MMM d')}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateToDay('next')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div 
        className="relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Pull to refresh indicator */}
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
                    onTaskClick={handleTaskClick}
                  />
                  
                  <TaskGroup
                    title="Afternoon"
                    tasks={afternoonTasks}
                    onTaskClick={handleTaskClick}
                  />
                  
                  <TaskGroup
                    title="Evening"
                    tasks={eveningTasks}
                    onTaskClick={handleTaskClick}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </div>
      
      {/* Show swipe indicators for navigation */}
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
