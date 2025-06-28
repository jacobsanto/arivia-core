
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { Task } from '@/services/task-management/task.service';

const TaskManagement: React.FC = () => {
  const {
    tasks,
    isLoading,
    completeTask,
    deleteTask,
    refetch
  } = useTaskManagement();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openTasks = tasks.filter(task => task.status === 'open');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleTaskComplete = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    // TODO: Open edit modal
  };

  const handleTaskView = (task: Task) => {
    setSelectedTask(task);
    // TODO: Open view modal
  };

  const TaskList: React.FC<{ tasks: Task[]; showActions?: boolean; emptyMessage?: string }> = ({ 
    tasks, 
    showActions = true, 
    emptyMessage = "No tasks found." 
  }) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task.title}</span>
                <div className="flex gap-2">
                  {showActions && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleTaskView(task)}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTaskEdit(task)}>
                        Edit
                      </Button>
                      {task.status !== 'completed' && (
                        <Button size="sm" onClick={() => handleTaskComplete(task.id)}>
                          Complete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
                {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList
            tasks={tasks}
            emptyMessage="No tasks found. Create your first task to get started."
          />
        </TabsContent>

        <TabsContent value="open">
          <TaskList
            tasks={openTasks}
            emptyMessage="No open tasks."
          />
        </TabsContent>

        <TabsContent value="in_progress">
          <TaskList
            tasks={inProgressTasks}
            emptyMessage="No tasks in progress."
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList
            tasks={completedTasks}
            showActions={false}
            emptyMessage="No completed tasks."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagement;
