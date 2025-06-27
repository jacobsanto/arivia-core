
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";

interface TasksScheduleProps {
  housekeepingTasks?: Task[];
  maintenanceTasks?: MaintenanceTask[];
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
}

const TasksSchedule = ({ housekeepingTasks = [], maintenanceTasks = [], tasks = [], onTaskClick }: TasksScheduleProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Combine all tasks
  const allTasks = [...(housekeepingTasks || []), ...(tasks || [])];
  
  // Filter and sort tasks for today
  const todayTasks = allTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDateString = typeof task.dueDate === 'string' 
      ? task.dueDate.split('T')[0]
      : task.dueDate.split('T')[0];
    return taskDateString === today;
  }).sort((a, b) => {
    const aDate = typeof a.dueDate === 'string' ? new Date(a.dueDate) : new Date();
    const bDate = typeof b.dueDate === 'string' ? new Date(b.dueDate) : new Date();
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tasks Schedule</span>
          <Badge variant="outline">
            {todayTasks.length} Tasks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No tasks scheduled for today
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    <Badge className="text-xs">{task.priority}</Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
                    {task.dueDate && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(typeof task.dueDate === 'string' ? new Date(task.dueDate) : new Date(), 'HH:mm')}
                      </span>
                    )}
                    {(task.assignedTo) && (
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {task.assignedTo}
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

export default TasksSchedule;
