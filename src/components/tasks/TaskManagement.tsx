import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, Calendar, User, MapPin, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CreateMaintenanceTaskDialog } from "@/components/maintenance/CreateMaintenanceTaskDialog";
import { TaskCreationDialog } from "@/components/tasks/TaskCreationDialog";
import { toastService } from "@/services/toast";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const TaskManagement: React.FC = () => {
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: housekeepingTasks } = useQuery({
    queryKey: ['housekeeping-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return CheckCircle;
      case 'in_progress': return Clock;
      case 'pending': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      toastService.success('Task started successfully!');
    } catch (error) {
      console.error('Error starting task:', error);
      toastService.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ status: 'done' })
        .eq('id', taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      toastService.success('Task completed successfully!');
    } catch (error) {
      console.error('Error completing task:', error);
      toastService.error('Failed to complete task');
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const StatusIcon = getStatusIcon(task.status);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-muted">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {task.task_type}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center">
                <UserAvatar 
                  userId={task.assigned_to} 
                  showName={false} 
                  size="sm" 
                />
                <span className="ml-2">
                  {task.assigned_to ? 'Assigned' : 'Unassigned'}
                </span>
              </div>
              {task.listing_id && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Property
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {task.status === 'pending' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartTask(task.id)}
                >
                  Start Task
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button 
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Task Management - Arivia Villas</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Housekeeping Tasks</h1>
            <p className="text-muted-foreground">Manage housekeeping tasks and create maintenance requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Housekeeping Task
            </Button>
            
            <CreateMaintenanceTaskDialog
              isOpen={isCreateMaintenanceOpen}
              onOpenChange={setIsCreateMaintenanceOpen}
              onTaskCreated={() => {
                toastService.success('Maintenance task created successfully!');
              }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Housekeeping Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {housekeepingTasks?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No housekeeping tasks found</p>
                  <p className="text-sm mt-2">Click "Create Housekeeping Task" to create your first task</p>
                </div>
              ) : (
                housekeepingTasks?.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <TaskCreationDialog 
          isOpen={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultTab="housekeeping"
        />
      </div>
    </>
  );
};
