
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMyTasks } from '@/hooks/useTaskManagement';

const StaffTasks: React.FC = () => {
  const { tasks, loading, updateTaskStatus } = useMyTasks();

  const handleTaskStatusUpdate = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'open') {
      await updateTaskStatus(taskId, 'in_progress');
    } else if (task.status === 'in_progress') {
      await updateTaskStatus(taskId, 'completed');
    }
  };

  const myOpenTasks = tasks.filter(task => task.status === 'open');
  const myInProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const myCompletedTasks = tasks.filter(task => task.status === 'completed');

  const TaskList: React.FC<{ 
    tasks: any[]; 
    onComplete?: (taskId: string) => void; 
    isStaffView?: boolean; 
    showActions?: boolean; 
    emptyMessage?: string; 
  }> = ({ 
    tasks, 
    onComplete, 
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
                {showActions && onComplete && (
                  <button
                    onClick={() => onComplete(task.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    {task.status === 'open' ? 'Start' : 'Complete'}
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
                {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex gap-2">
          <Badge variant="outline">{myOpenTasks.length} Open</Badge>
          <Badge variant="outline">{myInProgressTasks.length} In Progress</Badge>
          <Badge variant="outline">{myCompletedTasks.length} Completed</Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {myOpenTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={myOpenTasks}
                onComplete={handleTaskStatusUpdate}
                isStaffView={true}
                emptyMessage="No open tasks assigned to you."
              />
            </CardContent>
          </Card>
        )}

        {myInProgressTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={myInProgressTasks}
                onComplete={handleTaskStatusUpdate}
                isStaffView={true}
                emptyMessage="No tasks in progress."
              />
            </CardContent>
          </Card>
        )}

        {myCompletedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={myCompletedTasks}
                showActions={false}
                isStaffView={true}
                emptyMessage="No completed tasks."
              />
            </CardContent>
          </Card>
        )}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No tasks assigned to you yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StaffTasks;
