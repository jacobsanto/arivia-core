import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  MapPin,
  User,
  PlayCircle,
  CheckSquare
} from "lucide-react";
import { toastService } from "@/services/toast";

interface Task {
  id: string;
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  property_id?: string;
  assigned_to?: string;
  description?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

const HousekeepingKanban: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['housekeeping-kanban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    refetchInterval: 30000,
  });

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    return {
      pending: tasks.filter(task => task.status === 'pending'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      completed: tasks.filter(task => task.status === 'completed')
    };
  }, [tasks]);

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ 
          status: newStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['housekeeping-kanban'] });
      toastService.success('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      toastService.error('Failed to update task status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
    
    return (
      <Card className={`mb-3 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getPriorityColor(task.priority)}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Task Type and Priority */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">{task.task_type}</h4>
              {task.priority && (
                <Badge variant="outline" className="text-xs">
                  {task.priority}
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Property and Due Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.property_id && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Property {task.property_id}</span>
                </div>
              )}
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Assigned To */}
            {task.assigned_to && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{task.assigned_to}</span>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              {task.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              
              {task.status === 'in_progress' && (
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => updateTaskStatus(task.id, 'completed')}
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              
              {task.status === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const KanbanColumn: React.FC<{ 
    title: string; 
    status: keyof typeof tasksByStatus; 
    icon: React.ReactNode;
    bgColor: string;
  }> = ({ title, status, icon, bgColor }) => {
    const columnTasks = tasksByStatus[status];
    
    return (
      <div className="flex-1 min-w-80">
        <Card className="h-full">
          <CardHeader className={`pb-3 ${bgColor}`}>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {icon}
              {title}
              <Badge variant="secondary" className="ml-auto">
                {columnTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">No {status.replace('_', ' ')} tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Pending</span>
              <Badge className="ml-auto">{tasksByStatus.pending.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">In Progress</span>
              <Badge className="ml-auto">{tasksByStatus.in_progress.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Completed</span>
              <Badge className="ml-auto">{tasksByStatus.completed.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
          title="Pending" 
          status="pending" 
          icon={<AlertTriangle className="h-4 w-4" />}
          bgColor="bg-yellow-50 border-yellow-200"
        />
        <KanbanColumn 
          title="In Progress" 
          status="in_progress" 
          icon={<Clock className="h-4 w-4" />}
          bgColor="bg-blue-50 border-blue-200"
        />
        <KanbanColumn 
          title="Completed" 
          status="completed" 
          icon={<CheckCircle className="h-4 w-4" />}
          bgColor="bg-green-50 border-green-200"
        />
      </div>
    </div>
  );
};

export { HousekeepingKanban };
export default HousekeepingKanban;