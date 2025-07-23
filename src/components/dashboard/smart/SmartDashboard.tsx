import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Home, AlertTriangle, Settings, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
interface DashboardStats {
  totalProperties: number;
  pendingTasks: number;
  todayTasks: number;
  criticalIssues: number;
}
export const SmartDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    pendingTasks: 0,
    todayTasks: 0,
    criticalIssues: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch properties
      const {
        data: properties,
        error: propertiesError
      } = await supabase.from('guesty_listings').select('id').eq('is_deleted', false);
      if (propertiesError) throw propertiesError;

      // Fetch pending tasks
      const {
        data: pendingTasks,
        error: pendingError
      } = await supabase.from('housekeeping_tasks').select('id').eq('status', 'pending');
      if (pendingError) throw pendingError;

      // Fetch today's tasks
      const today = new Date().toISOString().split('T')[0];
      const {
        data: todayTasks,
        error: todayError
      } = await supabase.from('housekeeping_tasks').select('id').eq('due_date', today);
      if (todayError) throw todayError;

      // Fetch maintenance tasks
      const {
        data: maintenanceTasks,
        error: maintenanceError
      } = await supabase.from('maintenance_tasks').select('id').eq('priority', 'high').eq('status', 'pending');
      if (maintenanceError) throw maintenanceError;
      setStats({
        totalProperties: properties?.length || 0,
        pendingTasks: pendingTasks?.length || 0,
        todayTasks: todayTasks?.length || 0,
        criticalIssues: maintenanceTasks?.length || 0
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const statsCards = [{
    title: "Total Properties",
    value: stats.totalProperties,
    icon: <Home className="h-5 w-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    title: "Pending Tasks",
    value: stats.pendingTasks,
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    title: "Today's Tasks",
    value: stats.todayTasks,
    icon: <Calendar className="h-5 w-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50"
  }, {
    title: "Critical Issues",
    value: stats.criticalIssues,
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-red-600",
    bgColor: "bg-red-50"
  }];
  if (loading) {
    return <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Operations Dashboard</h1>
            <p className="text-muted-foreground">Manage your vacation rental operations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your vacation rental operations efficiently
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cleaning-settings')} variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cleaning Settings
          </Button>
          <Button onClick={() => navigate('/housekeeping')} className="flex items-center gap-2 text-[d1aa7e] text-zinc-50">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>)}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/housekeeping')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Housekeeping Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage cleaning schedules and tasks</p>
            <Badge variant="secondary" className="mt-2">
              {stats.pendingTasks} pending
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/properties')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View and manage your properties</p>
            <Badge variant="secondary" className="mt-2">
              {stats.totalProperties} properties
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/cleaning-settings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cleaning Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configure property-specific cleaning rules</p>
            <Badge variant="outline" className="mt-2">
              Customizable
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>;
};