
import React, { useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";

interface DailyAgendaProps {
  housekeepingTasks?: Task[];
  maintenanceTasks?: MaintenanceTask[];
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
  onRefresh?: () => void;
}

const DailyAgenda = ({ housekeepingTasks = [], maintenanceTasks = [], tasks = [], onTaskClick, onRefresh }: DailyAgendaProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Combine all tasks
  const allTasks = [...(housekeepingTasks || []), ...(tasks || [])];

  // Convert task date to string for comparison
  const getTaskDateString = (task: Task): string => {
    if (!task.dueDate) return '';
    if (typeof task.dueDate === 'string') {
      return task.dueDate.split('T')[0];
    }
    return task.dueDate.split('T')[0];
  };

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  // Filter tasks for the selected date
  const dayTasks = allTasks.filter(task => {
    const taskDateString = getTaskDateString(task);
    return taskDateString === selectedDateString;
  });

  // Sort tasks by priority and time
  const sortedTasks = dayTasks.sort((a, b) => {
    const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by due date
    const aDate = typeof a.dueDate === 'string' ? new Date(a.dueDate) : new Date();
    const bDate = typeof b.dueDate === 'string' ? new Date(b.dueDate) : new Date();
    return aDate.getTime() - bDate.getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Agenda</span>
          <Badge variant="outline">
            {format(selectedDate, 'MMM dd, yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No tasks scheduled for this day
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task)}
              >
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
                    {task.dueDate && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(typeof task.dueDate === 'string' ? new Date(task.dueDate) : new Date(), 'HH:mm')}
                      </span>
                    )}
                    
                    {(task.propertyId || task.property) && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {task.property || task.propertyId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyAgenda;
