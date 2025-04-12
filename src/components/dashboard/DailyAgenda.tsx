import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Task } from '@/types/taskTypes';
import { MaintenanceTask } from '@/types/maintenanceTypes';
import { useSwipe } from "@/hooks/use-swipe";
import { motion, AnimatePresence } from "framer-motion";
import SwipeIndicators from "@/components/profile/SwipeIndicators";
import { useSwipeHint } from "@/hooks/useSwipeHint";

interface DailyAgendaProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
}

interface CombinedTask {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  priority: string;
  property: string;
  taskType: "housekeeping" | "maintenance";
  status: string;
}

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  housekeepingTasks,
  maintenanceTasks
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { showSwipeHint, isMobile: isMobileDevice, resetSwipeHint } = useSwipeHint();

  // Combine housekeeping and maintenance tasks
  const combinedTasks: CombinedTask[] = [
    ...housekeepingTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: task.type,
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "housekeeping" as const
    })),
    ...maintenanceTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: "Maintenance",
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "maintenance" as const
    }))
  ];

  // Filter tasks for the selected date
  const tasksForSelectedDate = combinedTasks.filter(task => {
    try {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, selectedDate);
    } catch (e) {
      console.error("Invalid date format for task:", task.title);
      return false;
    }
  });

  // Sort tasks by time
  const sortedTasks = [...tasksForSelectedDate].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });

  // Group tasks by morning, afternoon, evening
  const morningTasks = sortedTasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 5 && hour < 12;
  });

  const afternoonTasks = sortedTasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 12 && hour < 18;
  });

  const eveningTasks = sortedTasks.filter(task => {
    const hour = new Date(task.dueDate).getHours();
    return hour >= 18 || hour < 5;
  });

  // Swipe to change days
  const { onTouchStart: swipeTouchStart, onTouchMove: swipeTouchMove, onTouchEnd: swipeTouchEnd } = useSwipe({
    onSwipeLeft: () => navigateToDay('next'),
    onSwipeRight: () => navigateToDay('prev'),
  });
  
  // Track pull-to-refresh
  const onTouchStart = (e: React.TouchEvent) => {
    if (isMobile && contentRef.current) {
      // Only enable pull-to-refresh when at the top of the content
      if (contentRef.current.scrollTop <= 0) {
        setPullStartY(e.touches[0].clientY);
        setPullMoveY(0);
      }
    }
    swipeTouchStart(e);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (isMobile && pullStartY > 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY;
      
      // Only allow pulling down, not up
      if (diff > 0) {
        // Resist the pull with a dampening factor
        const dampening = 0.4;
        setPullMoveY(diff * dampening);
        
        // Prevent default to disable scrolling while pulling
        if (diff > 30) {
          e.preventDefault();
        }
      }
    }
    swipeTouchMove(e);
  };
  
  const onTouchEnd = (e: React.TouchEvent) => {
    // If pulled enough, trigger refresh
    if (pullMoveY > 60) {
      refreshData();
    }
    
    // Reset pull values
    setPullStartY(0);
    setPullMoveY(0);
    swipeTouchEnd(e);
  };
  
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate a refresh - replace with actual data fetching
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
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
                  {morningTasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center my-1">
                        Morning
                        <div className="h-[1px] bg-border flex-1 ml-2"></div>
                      </h4>
                      {morningTasks.map(task => (
                        <AgendaTask 
                          key={`${task.taskType}-${task.id}`} 
                          task={task} 
                          onClick={() => handleTaskClick(task)} 
                        />
                      ))}
                    </div>
                  )}
                  
                  {afternoonTasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center my-1">
                        Afternoon
                        <div className="h-[1px] bg-border flex-1 ml-2"></div>
                      </h4>
                      {afternoonTasks.map(task => (
                        <AgendaTask 
                          key={`${task.taskType}-${task.id}`} 
                          task={task} 
                          onClick={() => handleTaskClick(task)} 
                        />
                      ))}
                    </div>
                  )}
                  
                  {eveningTasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center my-1">
                        Evening
                        <div className="h-[1px] bg-border flex-1 ml-2"></div>
                      </h4>
                      {eveningTasks.map(task => (
                        <AgendaTask 
                          key={`${task.taskType}-${task.id}`} 
                          task={task} 
                          onClick={() => handleTaskClick(task)} 
                        />
                      ))}
                    </div>
                  )}
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

interface AgendaTaskProps {
  task: CombinedTask;
  onClick: () => void;
}

const AgendaTask: React.FC<AgendaTaskProps> = ({ task, onClick }) => {
  const taskTime = format(parseISO(task.dueDate), 'h:mm a');
  
  // Prioritize which badge to show on mobile - only show the most important one
  const showPriorityBadge = task.priority === "High" || task.priority === "high";
  
  const priorityStyles = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800",
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800"
  };

  const statusStyles = {
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Completed: "bg-green-100 text-green-800",
  };

  const typeStyles = {
    housekeeping: "bg-purple-100 text-purple-800 border-purple-200",
    maintenance: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  return (
    <div 
      className="flex items-center p-2 rounded-md border hover:bg-secondary/50 active:bg-secondary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="min-w-[45px] text-2xs md:text-xs text-muted-foreground">
        {taskTime}
      </div>
      <div className="flex-1 ml-2 mr-1">
        <div className="font-medium text-sm line-clamp-1">{task.title}</div>
        <div className="text-2xs md:text-xs text-muted-foreground line-clamp-1">{task.property}</div>
      </div>
      <div className="ml-auto">
        {showPriorityBadge ? (
          <Badge variant="outline" className={priorityStyles[task.priority as keyof typeof priorityStyles]}>
            {task.priority}
          </Badge>
        ) : (
          <Badge variant="outline" className={typeStyles[task.taskType]}>
            {task.taskType === "housekeeping" ? "HK" : "MT"}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DailyAgenda;
