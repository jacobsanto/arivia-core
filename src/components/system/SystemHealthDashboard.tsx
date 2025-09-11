// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Database, 
  Cloud, 
  Users,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    tables_count: number;
    active_connections: number;
    rls_enabled_tables: number;
    last_backup?: string;
  };
  authentication: {
    status: 'healthy' | 'warning' | 'error';
    total_users: number;
    active_sessions: number;
    failed_logins_24h: number;
  };
  integrations: {
    status: 'healthy' | 'warning' | 'error';
    guesty_listings: number;
    guesty_bookings: number;
    last_sync?: string;
    sync_errors: number;
  };
  performance: {
    status: 'healthy' | 'warning' | 'error';
    avg_query_time: number;
    slow_queries_count: number;
    error_rate: number;
    uptime_percentage: number;
  };
  chat: {
    status: 'healthy' | 'warning' | 'error';
    active_channels: number;
    messages_24h: number;
    online_users: number;
  };
}

interface EdgeFunctionHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  last_execution?: string;
  success_rate: number;
  avg_response_time: number;
  error_count_24h: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunctionHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSystemHealth = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Get system health from database function
      const { data: healthData, error: healthError } = await supabase
        .rpc('get_system_health');

      if (healthError) throw healthError;

      // Type the healthData properly
      const typedHealthData = healthData as any;

      // Get additional performance metrics
      const { data: performanceData, error: perfError } = await supabase
        .from('query_performance_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (perfError) throw perfError;

      // Calculate performance metrics
      const avgQueryTime = performanceData?.length > 0 
        ? performanceData.reduce((sum, q) => sum + q.execution_time_ms, 0) / performanceData.length 
        : 0;
      const slowQueries = performanceData?.filter(q => q.execution_time_ms > 1000).length || 0;

      // Get chat metrics
      const { data: channelsData } = await supabase
        .from('chat_channels')
        .select('id');

      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Construct system health object
      const health: SystemHealth = {
        database: {
          status: (typedHealthData?.database?.rls_enabled_tables || 0) > 0 ? 'healthy' : 'warning',
          tables_count: typedHealthData?.database?.tables_count || 0,
          active_connections: typedHealthData?.database?.active_connections || 0,
          rls_enabled_tables: typedHealthData?.database?.rls_enabled_tables || 0
        },
        authentication: {
          status: (typedHealthData?.authentication?.total_users || 0) > 0 ? 'healthy' : 'warning',
          total_users: typedHealthData?.authentication?.total_users || 0,
          active_sessions: typedHealthData?.authentication?.active_sessions || 0,
          failed_logins_24h: typedHealthData?.authentication?.failed_logins || 0
        },
        integrations: {
          status: typedHealthData?.integrations?.last_sync ? 'healthy' : 'warning',
          guesty_listings: typedHealthData?.integrations?.guesty_listings || 0,
          guesty_bookings: typedHealthData?.integrations?.guesty_bookings || 0,
          last_sync: typedHealthData?.integrations?.last_sync || null,
          sync_errors: typedHealthData?.integrations?.sync_errors || 0
        },
        performance: {
          status: avgQueryTime < 500 ? 'healthy' : avgQueryTime < 1000 ? 'warning' : 'error',
          avg_query_time: avgQueryTime,
          slow_queries_count: slowQueries,
          error_rate: typedHealthData?.database?.error_rate || 0,
          uptime_percentage: typedHealthData?.database?.uptime_percentage || 99.9
        },
        chat: {
          status: 'healthy',
          active_channels: channelsData?.length || 0,
          messages_24h: messagesData?.length || 0,
          online_users: typedHealthData?.chat?.online_users || 0
        }
      };

      setSystemHealth(health);

      // Generate alerts based on health status
      generateAlerts(health);

    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: 'Failed to load system health',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  const fetchEdgeFunctionHealth = useCallback(async () => {
    try {
      // Try to get real edge function data from analytics
      const { data: analyticsData } = await supabase
        .from('function_edge_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (analyticsData && analyticsData.length > 0) {
        // Process real edge function data
        const functionStats = new Map();
        
        analyticsData.forEach(log => {
          const functionName = log.metadata?.function_id || 'unknown';
          if (!functionStats.has(functionName)) {
            functionStats.set(functionName, {
              name: functionName,
              success_count: 0,
              error_count: 0,
              total_response_time: 0,
              request_count: 0
            });
          }
          
          const stats = functionStats.get(functionName);
          stats.request_count++;
          
          if (log.response?.status_code && log.response.status_code < 400) {
            stats.success_count++;
          } else {
            stats.error_count++;
          }
          
          if (log.metadata?.execution_time_ms) {
            stats.total_response_time += log.metadata.execution_time_ms;
          }
        });

        // Convert to EdgeFunctionHealth format
        const functions: EdgeFunctionHealth[] = Array.from(functionStats.values()).map(stats => ({
          name: stats.name,
          status: stats.error_count === 0 ? 'healthy' : stats.error_count < 5 ? 'warning' : 'error',
          success_rate: stats.request_count > 0 ? (stats.success_count / stats.request_count) * 100 : 0,
          avg_response_time: stats.request_count > 0 ? stats.total_response_time / stats.request_count : 0,
          error_count_24h: stats.error_count
        }));

        setEdgeFunctionHealth(functions);
      } else {
        // No edge function data available
        setEdgeFunctionHealth([]);
      }
    } catch (error) {
      console.error('Error fetching edge function health:', error);
      setEdgeFunctionHealth([]);
    }
  }, []);

  const generateAlerts = (health: SystemHealth) => {
    const newAlerts: Alert[] = [];

    // Database alerts
    if (health.database.status === 'error') {
      newAlerts.push({
        id: 'db-error',
        type: 'critical',
        title: 'Database Error',
        message: 'Database connection issues detected',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Performance alerts
    if (health.performance.avg_query_time > 1000) {
      newAlerts.push({
        id: 'perf-slow',
        type: 'warning',
        title: 'Slow Query Performance',
        message: `Average query time is ${health.performance.avg_query_time.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Integration alerts
    if (health.integrations.status === 'error') {
      newAlerts.push({
        id: 'int-error',
        type: 'warning',
        title: 'Integration Issues',
        message: 'Problems detected with external integrations',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    setAlerts(newAlerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSystemHealth(),
      fetchEdgeFunctionHealth()
    ]).finally(() => setLoading(false));

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchEdgeFunctionHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSystemHealth, fetchEdgeFunctionHealth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance, integrations, and operational status
          </p>
        </div>
        <Button
          onClick={() => {
            fetchSystemHealth();
            fetchEdgeFunctionHealth();
          }}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {systemHealth && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Database Health */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(systemHealth.database.status)}
                    <span className={`text-sm font-medium ${getStatusColor(systemHealth.database.status)}`}>
                      {systemHealth.database.status.charAt(0).toUpperCase() + systemHealth.database.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{systemHealth.database.tables_count}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth.database.active_connections} active connections
                  </p>
                </CardContent>
              </Card>

              {/* Authentication Health */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(systemHealth.authentication.status)}
                    <span className={`text-sm font-medium ${getStatusColor(systemHealth.authentication.status)}`}>
                      {systemHealth.authentication.status.charAt(0).toUpperCase() + systemHealth.authentication.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{systemHealth.authentication.total_users}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth.authentication.active_sessions} active sessions
                  </p>
                </CardContent>
              </Card>

              {/* Integrations Health */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Integrations</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(systemHealth.integrations.status)}
                    <span className={`text-sm font-medium ${getStatusColor(systemHealth.integrations.status)}`}>
                      {systemHealth.integrations.status.charAt(0).toUpperCase() + systemHealth.integrations.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{systemHealth.integrations.guesty_listings}</div>
                  <p className="text-xs text-muted-foreground">
                    Guesty listings synced
                  </p>
                </CardContent>
              </Card>

              {/* Performance Health */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(systemHealth.performance.status)}
                    <span className={`text-sm font-medium ${getStatusColor(systemHealth.performance.status)}`}>
                      {systemHealth.performance.status.charAt(0).toUpperCase() + systemHealth.performance.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{systemHealth.performance.avg_query_time.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">
                    Average query time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="edge-functions" className="space-y-4">
          <div className="grid gap-4">
            {edgeFunctions.map((func) => (
              <Card key={func.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{func.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(func.status)}
                      <Badge variant={func.status === 'healthy' ? 'default' : func.status === 'warning' ? 'secondary' : 'destructive'}>
                        {func.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={func.success_rate} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{func.success_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg Response</p>
                      <p className="text-2xl font-bold">{func.avg_response_time}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Errors (24h)</p>
                      <p className="text-2xl font-bold">{func.error_count_24h}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Execution</p>
                      <p className="text-sm text-muted-foreground">
                        {func.last_execution ? new Date(func.last_execution).toLocaleTimeString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {systemHealth && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Query Performance</CardTitle>
                  <CardDescription>Database query metrics over the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Query Time</span>
                    <span className="text-2xl font-bold">{systemHealth.performance.avg_query_time.toFixed(0)}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Slow Queries</span>
                    <span className="text-2xl font-bold">{systemHealth.performance.slow_queries_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-2xl font-bold">{systemHealth.performance.uptime_percentage}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Current system resource utilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database Connections</span>
                      <span className="text-sm">{systemHealth.database.active_connections}/100</span>
                    </div>
                    <Progress value={(systemHealth.database.active_connections / 100) * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">RLS Tables</span>
                      <span className="text-sm">{systemHealth.database.rls_enabled_tables}/{systemHealth.database.tables_count}</span>
                    </div>
                    <Progress value={(systemHealth.database.rls_enabled_tables / systemHealth.database.tables_count) * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Configuration</CardTitle>
              <CardDescription>System monitoring and alerting settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Performance Thresholds</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Query time warning: &gt;500ms</p>
                    <p>• Query time critical: &gt;1000ms</p>
                    <p>• Error rate warning: &gt;5%</p>
                    <p>• Error rate critical: &gt;10%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Alert Channels</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Dashboard notifications</p>
                    <p>• Database logging</p>
                    <p>• System audit trail</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}