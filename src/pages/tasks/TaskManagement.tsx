
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import TaskList from '@/components/task-management/TaskList';
import TaskFilters from '@/components/task-management/TaskFilters';
import { Task, TaskFilters as TaskFiltersType } from '@/types/task-management';

const TaskManagement: React.FC = () => {
  const {
    tasks,
    loading,
    filters,
    applyFilters,
    completeTask,
    deleteTask,
    refreshTasks
  } = useTaskManagement();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleClearFilters = () => {
    applyFilters({});
  };

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

  if (loading) {
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TaskFilters
            filters={filters}
            onFiltersChange={applyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3">
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
                onComplete={handleTaskComplete}
                onEdit={handleTaskEdit}
                onView={handleTaskView}
                emptyMessage="No tasks found. Create your first task to get started."
              />
            </TabsContent>

            <TabsContent value="open">
              <TaskList
                tasks={openTasks}
                onComplete={handleTaskComplete}
                onEdit={handleTaskEdit}
                onView={handleTaskView}
                emptyMessage="No open tasks."
              />
            </TabsContent>

            <TabsContent value="in_progress">
              <TaskList
                tasks={inProgressTasks}
                onComplete={handleTaskComplete}
                onEdit={handleTaskEdit}
                onView={handleTaskView}
                emptyMessage="No tasks in progress."
              />
            </TabsContent>

            <TabsContent value="completed">
              <TaskList
                tasks={completedTasks}
                onEdit={handleTaskEdit}
                onView={handleTaskView}
                showActions={false}
                emptyMessage="No completed tasks."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
