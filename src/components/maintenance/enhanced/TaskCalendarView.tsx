import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTaskEnhanced } from "@/types/maintenance-enhanced.types";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Clock, AlertTriangle, Wrench } from "lucide-react";

interface TaskCalendarViewProps {
  tasks: MaintenanceTaskEnhanced[];
  onTaskClick: (task: MaintenanceTaskEnhanced) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = task.scheduledDate || task.dueDate;
      if (!taskDate) return false;
      return isSameDay(new Date(taskDate), date);
    });
  };

  const getSelectedDateTasks = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Wrench;
      case 'on_hold': return AlertTriangle;
      default: return Clock;
    }
  };

  // Create calendar events for tasks
  const calendarTasks = React.useMemo(() => {
    const monthStart = selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date());
    const monthEnd = selectedDate ? endOfMonth(selectedDate) : endOfMonth(new Date());
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return monthDays.reduce((acc, day) => {
      const dayTasks = getTasksForDate(day);
      if (dayTasks.length > 0) {
        acc[format(day, 'yyyy-MM-dd')] = dayTasks;
      }
      return acc;
    }, {} as Record<string, MaintenanceTaskEnhanced[]>);
  }, [tasks, selectedDate]);

  const modifiers = {
    hasTasks: (date: Date) => {
      const dayKey = format(date, 'yyyy-MM-dd');
      return Boolean(calendarTasks[dayKey]?.length);
    }
  };

  const modifiersStyles = {
    hasTasks: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '4px',
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? format(selectedDate, 'MMMM d, yyyy')
                : 'Select a date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSelectedDateTasks().length > 0 ? (
                getSelectedDateTasks().map((task) => {
                  const StatusIcon = getStatusIcon(task.status);
                  return (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.property.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusIcon className="h-3 w-3" />
                            <span className="text-xs capitalize">{task.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {task.assignee.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No maintenance tasks scheduled for this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskCalendarView;