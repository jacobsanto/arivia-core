import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar,
  Download,
  Filter,
  Users,
  MapPin
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const HousekeepingReports: React.FC = () => {
  const [dateRange, setDateRange] = useState('week');
  const [selectedProperty, setSelectedProperty] = useState('all');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: now, end: now };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case '30days':
        return { start: subDays(now, 30), end: now };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const { start, end } = getDateRange();

  // Fetch tasks data for reports
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['housekeeping-reports', dateRange, selectedProperty],
    queryFn: async () => {
      let query = supabase
        .from('housekeeping_tasks')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (selectedProperty !== 'all') {
        query = query.eq('listing_id', selectedProperty);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Group by task type
    const taskTypes = tasks.reduce((acc, task) => {
      acc[task.task_type] = (acc[task.task_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by staff member
    const staffStats = tasks.reduce((acc, task) => {
      if (task.assigned_to) {
        if (!acc[task.assigned_to]) {
          acc[task.assigned_to] = { total: 0, completed: 0 };
        }
        acc[task.assigned_to].total += 1;
        if (task.status === 'done') {
          acc[task.assigned_to].completed += 1;
        }
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Daily distribution
    const dailyStats = tasks.reduce((acc, task) => {
      const date = format(new Date(task.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate,
      taskTypes,
      staffStats,
      dailyStats
    };
  }, [tasks]);

  // Get unique properties for filter
  const properties = React.useMemo(() => {
    const unique = [...new Set(tasks.map(t => t.listing_id).filter(Boolean))];
    return unique;
  }, [tasks]);

  const exportData = () => {
    const csvContent = [
      'Date,Task Type,Status,Property,Assigned To,Priority',
      ...tasks.map(task => 
        `${task.created_at},${task.task_type},${task.status},${task.listing_id || ''},${task.assigned_to || ''},${task.priority || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `housekeeping-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Housekeeping Reports</h2>
          <p className="text-muted-foreground">Performance analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map(property => (
                <SelectItem key={property} value={property}>
                  Property {property}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.completionRate}% rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Task Distribution</CardTitle>
                <CardDescription>Tasks created per day in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.dailyStats)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between">
                        <span className="text-sm">{format(new Date(date), 'MMM dd')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...Object.values(stats.dailyStats))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Task Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Types</CardTitle>
                <CardDescription>Breakdown by cleaning task type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.taskTypes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...Object.values(stats.taskTypes))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Individual staff member statistics and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.staffStats).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No staff assignments in the selected period</p>
                  </div>
                ) : (
                  Object.entries(stats.staffStats)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([staff, data]) => {
                      const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                      return (
                        <div key={staff} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">{staff}</span>
                            </div>
                            <Badge variant="outline">{completionRate}% completion</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total: </span>
                              <span className="font-medium">{data.total}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Completed: </span>
                              <span className="font-medium text-green-600">{data.completed}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pending: </span>
                              <span className="font-medium text-orange-600">{data.total - data.completed}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Detailed view of all tasks in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>No tasks found in the selected period</p>
                  </div>
                ) : (
                  tasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">{task.task_type}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {task.listing_id && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>Property {task.listing_id}</span>
                              </div>
                            )}
                            <span>{format(new Date(task.created_at), 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                
                {tasks.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 10 of {tasks.length} tasks. Export for full data.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};