import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, Calendar, User, MapPin, Plus, Wrench, TrendingUp } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CreateMaintenanceTaskDialog } from "@/components/maintenance/CreateMaintenanceTaskDialog";
import { toastService } from "@/services/toast";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const MaintenanceTaskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: maintenanceTasks, isLoading } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'pending': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toastService.success('Task started successfully!');
    } catch (error) {
      console.error('Error starting task:', error);
      toastService.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
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
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority} priority
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
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
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Property
              </div>
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

  // Enhanced stats calculation
  const stats = {
    total: maintenanceTasks?.length || 0,
    pending: maintenanceTasks?.filter(t => t.status === 'pending').length || 0,
    inProgress: maintenanceTasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: maintenanceTasks?.filter(t => t.status === 'completed').length || 0,
    highPriority: maintenanceTasks?.filter(t => t.priority === 'high').length || 0,
    // New calculations for the cards
    dueTodayCount: maintenanceTasks?.filter(t => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length || 0,
    completedToday: maintenanceTasks?.filter(t => {
      if (!t.completed_at) return false;
      const completedDate = new Date(t.completed_at);
      const today = new Date();
      return completedDate.toDateString() === today.toDateString();
    }).length || 0,
    activeStaff: new Set(maintenanceTasks?.filter(t => 
      t.assigned_to && t.status === 'in_progress'
    ).map(t => t.assigned_to)).size || 0,
    // Calculate real average duration from completed tasks
    avgDuration: (() => {
      const completedWithDuration = maintenanceTasks?.filter(t => 
        t.status === 'completed' && t.created_at && t.completed_at
      ) || [];
      
      if (completedWithDuration.length === 0) return 0;
      
      const totalMinutes = completedWithDuration.reduce((sum, task) => {
        const start = new Date(task.created_at);
        const end = new Date(task.completed_at!);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
        return sum + duration;
      }, 0);
      
      return Math.round(totalMinutes / completedWithDuration.length);
    })(),
    completionRate: maintenanceTasks?.length > 0 ? 
      Math.round((maintenanceTasks.filter(t => t.status === 'completed').length / maintenanceTasks.length) * 100) : 0
  };

  return (
    <>
      <Helmet>
        <title>Maintenance Management - Arivia Villas</title>
        <meta name="description" content="Manage and track maintenance tasks across all properties" />
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              Maintenance Management
            </h1>
            <p className="text-muted-foreground">Track and manage maintenance tasks across all properties</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Maintenance Task
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                  <p className="text-2xl font-bold">{stats.dueTodayCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress value={stats.dueTodayCount > 0 ? (stats.completedToday / stats.dueTodayCount) * 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedToday} completed, {stats.dueTodayCount - stats.completedToday} remaining
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold">{stats.activeStaff}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Currently on duty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {stats.avgDuration > 0 ? `${stats.avgDuration}min` : 'N/A'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">
                    {stats.avgDuration > 0 ? 'Based on completed tasks' : 'No completed tasks yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{stats.highPriority}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Maintenance Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Loading maintenance tasks...</p>
                    </div>
                  ) : maintenanceTasks?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No maintenance tasks found</p>
                      <p className="text-sm mt-2">Click "Add Maintenance Task" to create your first task</p>
                    </div>
                  ) : (
                    maintenanceTasks?.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {['pending', 'in_progress', 'completed'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)} Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceTasks?.filter(task => task.status === status)?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No {status.replace('_', ' ')} maintenance tasks found</p>
                      </div>
                    ) : (
                      maintenanceTasks?.filter(task => task.status === status)?.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Create Maintenance Task Dialog */}
        <CreateMaintenanceTaskDialog
          isOpen={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          onTaskCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
          }}
        />
      </div>
    </>
  );
};