
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  priority: string;
}

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const priorityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
  }[task.priority];

  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary cursor-pointer">
      <div className="flex flex-col">
        <span className="font-medium text-sm">{task.title}</span>
        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-md text-xs ${priorityColor}`}>
          {task.priority}
        </div>
        <Badge variant="outline">{task.type}</Badge>
      </div>
    </div>
  );
};

interface TasksScheduleProps {
  tasks: Task[];
}

const TasksSchedule: React.FC<TasksScheduleProps> = ({ tasks }) => {
  const date = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>Upcoming tasks and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            className="rounded-md border"
          />
          
          <div className="space-y-2 mt-4">
            <h4 className="font-medium text-sm">Upcoming Tasks</h4>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksSchedule;
