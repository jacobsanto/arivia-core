import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Activity
} from "lucide-react";

export const HousekeepingDashboard: React.FC = () => {
  // Fetch housekeeping tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['housekeeping-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Calculate statistics including performance metrics
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => task.due_date?.startsWith(today));
    const completedTasks = todayTasks.filter(task => task.status === 'completed');
    const allCompletedTasks = tasks.filter(task => task.status === 'completed' && task.completed_at);
    const activeStaff = new Set(tasks
      .filter(task => task.assigned_to && task.status === 'in_progress')
      .map(task => task.assigned_to)
    ).size;

    // Calculate average duration for completed tasks
    let avgDuration = 0;
    if (allCompletedTasks.length > 0) {
      const totalMinutes = allCompletedTasks.reduce((sum, task) => {
        if (task.created_at && task.completed_at) {
          const start = new Date(task.created_at);
          const end = new Date(task.completed_at);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
          return sum + duration;
        }
        return sum;
      }, 0);
      avgDuration = Math.round(totalMinutes / allCompletedTasks.length);
    }

    // Calculate quality score based on QC pass rate
    const qcTasks = tasks.filter(task => task.qc_status && task.qc_status !== 'pending');
    const passedQC = qcTasks.filter(task => task.qc_status === 'passed').length;
    const qualityScore = qcTasks.length > 0 ? Math.round((passedQC / qcTasks.length) * 100) : 0;

    return {
      totalTasks: tasks.length,
      todayTasks: todayTasks.length,
      completedToday: completedTasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      inProgressTasks: tasks.filter(task => task.status === 'in_progress').length,
      activeStaff,
      completionRate: todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0,
      avgDuration,
      qualityScore
    };
  }, [tasks]);

  // Recent activity (last 5 updated tasks)
  const recentActivity = React.useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
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
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{stats.todayTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedToday} completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completionRate}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting assignment
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently active
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{stats.activeStaff}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently working
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest task updates and completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.task_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.listing_id ? `Property ${task.listing_id}` : 'No property assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(task.updated_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common housekeeping management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium">Emergency Cleaning</p>
                    <p className="text-sm text-muted-foreground">Schedule urgent cleaning for incoming guests</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Staff Assignment</p>
                    <p className="text-sm text-muted-foreground">Assign staff to properties for today</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Schedule Review</p>
                    <p className="text-sm text-muted-foreground">Review and optimize cleaning schedules</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Key metrics and trends for housekeeping operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Efficiency Up</span>
              </div>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
              <p className="text-sm text-muted-foreground">Task completion rate</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-blue-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.avgDuration > 0 ? `${stats.avgDuration}m` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Per cleaning task</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-purple-600 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Quality Score</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.qualityScore > 0 ? `${stats.qualityScore}%` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">QC pass rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
