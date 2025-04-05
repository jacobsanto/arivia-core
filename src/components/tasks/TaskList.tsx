import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from "@/components/tasks/TaskCard";
import { Task } from "@/types/taskTypes";

interface TaskListProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

const TaskList = ({ tasks, onOpenTask }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardHeader>
          <CardTitle>No tasks found</CardTitle>
          <CardDescription>
            Try adjusting your filters or create a new task.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task)} />
      ))}
    </div>
  );
};

export default TaskList;
