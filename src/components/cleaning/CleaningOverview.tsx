import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin,
  Activity,
  TrendingUp
} from 'lucide-react';

export const CleaningOverview: React.FC = () => {
  // Mock data - replace with real data
  const stats = {
    todayTasks: 12,
    completedTasks: 8,
    activeStaff: 6,
    avgDuration: 45,
    upcomingBookings: 15,
    completionRate: 85
  };

  const recentActivity = [
    { id: 1, property: 'Villa Santorini', staff: 'Maria K.', status: 'completed', time: '2 hours ago' },
    { id: 2, property: 'Villa Mykonos', staff: 'John D.', status: 'in_progress', time: '30 min ago' },
    { id: 3, property: 'Villa Crete', staff: 'Anna P.', status: 'pending', time: '1 hour ago' },
  ];

  const quickActions = [
    { 
      title: 'Emergency Cleaning', 
      description: 'Schedule urgent cleaning for incoming guests',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    { 
      title: 'Staff Assignment', 
      description: 'Assign staff to properties for today',
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      title: 'Schedule Review', 
      description: 'Review and optimize cleaning schedules',
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
              <Progress value={(stats.completedTasks / stats.todayTasks) * 100} className="h-2" />
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
                <p className="text-2xl font-bold">{stats.avgDuration}min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600">5% faster this week</p>
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
            <CardDescription>Latest cleaning task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.property}</p>
                      <p className="text-sm text-muted-foreground">{activity.staff}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common cleaning management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
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
    </div>
  );
};