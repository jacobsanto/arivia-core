
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { useIsMobile } from "@/hooks/use-mobile";

interface TasksScheduleProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
  onCreateTask?: () => void;
}

const TasksSchedule: React.FC<TasksScheduleProps> = ({ 
  housekeepingTasks = [], 
  maintenanceTasks = [],
  onCreateTask
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const isMobile = useIsMobile();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const allTasks = useMemo(() => [
    ...housekeepingTasks,
    ...maintenanceTasks
  ], [housekeepingTasks, maintenanceTasks]);

  const getTasksForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return allTasks.filter(task => task.dueDate?.startsWith(dayStr));
  };

  const hasAnyTasks = allTasks.length > 0;

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  if (!hasAnyTasks) {
    return (
      <EmptyState
        icon={Calendar}
        title="No Tasks Scheduled"
        description="No housekeeping or maintenance tasks are currently scheduled. Create your first task to get started."
        action={onCreateTask ? {
          label: "Create First Task",
          onClick: onCreateTask
        } : undefined}
        compact={isMobile}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <span className={isMobile ? "text-base" : "text-lg"}>
              Weekly Schedule
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium px-3 py-1 bg-muted rounded-md whitespace-nowrap">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-7'}`}>
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`p-3 rounded-lg border ${
                  isToday ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                } ${isMobile ? 'min-h-[80px]' : 'min-h-[120px]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {format(day, isMobile ? 'EEE' : 'EEEE')}
                  </div>
                  <div className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No tasks
                    </div>
                  ) : (
                    dayTasks.slice(0, isMobile ? 2 : 3).map((task, index) => (
                      <div
                        key={`${task.id}-${index}`}
                        className="p-2 bg-background rounded text-xs"
                      >
                        <div className="font-medium truncate mb-1">
                          {task.title || 'Untitled Task'}
                        </div>
                        <Badge
                          variant={task.status === 'completed' || task.status === 'Completed' ? 'default' : 'secondary'}
                          className="text-xs px-1 py-0"
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))
                  )}
                  {dayTasks.length > (isMobile ? 2 : 3) && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayTasks.length - (isMobile ? 2 : 3)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksSchedule;
