import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MaintenanceActivityDialog } from './MaintenanceActivityDialog';
import { MaintenanceQuickActionDialog } from './MaintenanceQuickActionDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin,
  Activity,
  TrendingUp,
  Wrench
} from 'lucide-react';

export const MaintenanceOverview: React.FC = () => {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isQuickActionDialogOpen, setIsQuickActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'emergency' | 'inspection' | 'scheduling' | null>(null);

  // Fetch real-time maintenance stats
  const { data: maintenanceTasks } = useQuery({
    queryKey: ['maintenance-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate real stats from database
  const stats = React.useMemo(() => {
    if (!maintenanceTasks) {
      return {
        todayTasks: 0,
        completedTasks: 0,
        activeStaff: 0,
        avgDuration: 0,
        urgentTasks: 0,
        completionRate: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = maintenanceTasks.filter(task => 
      task.due_date && task.due_date.startsWith(today)
    );
    const completedTasks = todayTasks.filter(task => task.status === 'completed');
    const uniqueStaff = new Set(maintenanceTasks
      .filter(task => task.assigned_to && task.status === 'in_progress')
      .map(task => task.assigned_to)
    );

    // Calculate average duration for completed tasks
    const completedWithDuration = maintenanceTasks.filter(task => 
      task.status === 'completed' && task.created_at && task.completed_at
    );
    
    let avgDuration = 0;
    if (completedWithDuration.length > 0) {
      const totalMinutes = completedWithDuration.reduce((sum, task) => {
        const start = new Date(task.created_at);
        const end = new Date(task.completed_at!);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
        return sum + duration;
      }, 0);
      avgDuration = Math.round(totalMinutes / completedWithDuration.length);
    }

    return {
      todayTasks: todayTasks.length,
      completedTasks: completedTasks.length,
      activeStaff: uniqueStaff.size,
      avgDuration,
      urgentTasks: maintenanceTasks.filter(task => task.priority === 'high' && task.status !== 'completed').length,
      completionRate: todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0
    };
  }, [maintenanceTasks]);

  // Fetch recent activity from database
  const { data: recentActivity } = useQuery({
    queryKey: ['maintenance-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const quickActions = [
    { 
      id: 'emergency',
      title: 'Emergency Repair', 
      description: 'Report and schedule urgent maintenance',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    { 
      id: 'inspection',
      title: 'Property Inspection', 
      description: 'Schedule routine property inspections',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    { 
      id: 'scheduling',
      title: 'Maintenance Scheduling', 
      description: 'Plan and optimize maintenance schedules',
      icon: Calendar,
      color: 'text-green-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId as 'emergency' | 'inspection' | 'scheduling');
    setIsQuickActionDialogOpen(true);
  };

  const handleViewAllActivity = () => {
    setIsActivityDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{stats.todayTasks}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={stats.todayTasks > 0 ? (stats.completedTasks / stats.todayTasks) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedTasks} completed, {stats.todayTasks - stats.completedTasks} remaining
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
              <Users className="h-8 w-8 text-green-600" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest maintenance task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {activity.assigned_to || 'Unassigned'}
                          </p>
                          <span className={`text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                            {activity.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.updated_at 
                          ? new Date(activity.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'No time'
                        }
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={handleViewAllActivity}
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common maintenance management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => handleQuickAction(action.id)}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Dialog */}
      <MaintenanceActivityDialog
        isOpen={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
      />

      {/* Quick Action Dialog */}
      <MaintenanceQuickActionDialog
        isOpen={isQuickActionDialogOpen}
        onOpenChange={setIsQuickActionDialogOpen}
        actionType={selectedAction}
      />
    </div>
  );
};