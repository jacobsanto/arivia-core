import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Task } from '@/types/taskTypes';
import { MaintenanceTask } from '@/types/maintenanceTypes';

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
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const navigateToDay = (direction: 'next' | 'prev') => {
    setSelectedDate(prevDate => 
      direction === 'next' ? addDays(prevDate, 1) : addDays(prevDate, -1)
    );
  };

  const handleTaskClick = (task: CombinedTask) => {
    if (task.taskType === "housekeeping") {
      navigate(`/housekeeping?taskId=${task.id}`);
    } else {
      navigate(`/maintenance?taskId=${task.id}`);
    }
  };

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

  return (
    <Card className="w-full">
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
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No tasks scheduled for {format(selectedDate, 'MMMM d')}
          </div>
        ) : (
          <div className="space-y-4">
            {morningTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
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
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
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
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
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
      </CardContent>
    </Card>
  );
};

interface AgendaTaskProps {
  task: CombinedTask;
  onClick: () => void;
}

const AgendaTask: React.FC<AgendaTaskProps> = ({ task, onClick }) => {
  const taskTime = format(new Date(task.dueDate), 'h:mm a');
  
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
      className="flex items-center p-2 rounded-md border hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="min-w-[60px] text-sm text-muted-foreground">
        {taskTime}
      </div>
      <div className="flex-1 ml-2">
        <div className="font-medium text-sm">{task.title}</div>
        <div className="text-xs text-muted-foreground">{task.property}</div>
      </div>
      <div className="flex flex-wrap gap-1 ml-1">
        <Badge variant="outline" className={typeStyles[task.taskType]}>
          {task.taskType === "housekeeping" ? "Housekeeping" : "Maintenance"}
        </Badge>
        <Badge className={priorityStyles[task.priority as keyof typeof priorityStyles]}>
          {task.priority}
        </Badge>
      </div>
    </div>
  );
};

export default DailyAgenda;
