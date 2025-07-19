import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Database,
  Globe
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState({
    cpu: 45,
    memory: 62,
    network: 78,
    loadTime: 1.2,
    responseTime: 85,
    uptime: 99.8
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState<Array<{
    time: string;
    cpu: number;
    memory: number;
    network: number;
  }>>([]);

  const [apiPerformance, setApiPerformance] = useState([
    { endpoint: '/api/properties', avgResponseTime: 120, requests: 1250, errors: 2 },
    { endpoint: '/api/bookings', avgResponseTime: 180, requests: 890, errors: 0 },
    { endpoint: '/api/tasks', avgResponseTime: 95, requests: 2100, errors: 5 },
    { endpoint: '/api/inventory', avgResponseTime: 145, requests: 678, errors: 1 },
    { endpoint: '/api/reports', avgResponseTime: 350, requests: 234, errors: 3 }
  ]);

  const [systemHealth, setSystemHealth] = useState([
    { service: 'Database', status: 'healthy', uptime: 99.9, lastCheck: '2 minutes ago' },
    { service: 'API Gateway', status: 'healthy', uptime: 99.8, lastCheck: '1 minute ago' },
    { service: 'File Storage', status: 'warning', uptime: 98.5, lastCheck: '5 minutes ago' },
    { service: 'Email Service', status: 'healthy', uptime: 99.7, lastCheck: '3 minutes ago' },
    { service: 'Push Notifications', status: 'healthy', uptime: 99.9, lastCheck: '1 minute ago' }
  ]);

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      
      setRealTimeMetrics(prev => {
        const newData = {
          time: timeString,
          cpu: Math.floor(Math.random() * 30) + 30,
          memory: Math.floor(Math.random() * 40) + 40,
          network: Math.floor(Math.random() * 50) + 50
        };
        
        return [...prev.slice(-9), newData];
      });

      // Update performance data
      setPerformanceData(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 40) + 40,
        network: Math.floor(Math.random() * 50) + 50,
        responseTime: Math.floor(Math.random() * 50) + 50
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const performanceHistory = [
    { time: '00:00', loadTime: 1.1, responseTime: 80, users: 45 },
    { time: '04:00', loadTime: 0.9, responseTime: 75, users: 32 },
    { time: '08:00', loadTime: 1.3, responseTime: 95, users: 78 },
    { time: '12:00', loadTime: 1.5, responseTime: 110, users: 124 },
    { time: '16:00', loadTime: 1.4, responseTime: 105, users: 156 },
    { time: '20:00', loadTime: 1.2, responseTime: 88, users: 98 },
    { time: '24:00', loadTime: 1.0, responseTime: 72, users: 67 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Performance Monitor
        </h2>
        <p className="text-muted-foreground">
          Monitor system performance and application health metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">{performanceData.cpu}%</p>
              </div>
              <Cpu className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={performanceData.cpu} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{performanceData.memory}%</p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={performanceData.memory} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{performanceData.responseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">12% faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{performanceData.uptime}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-3">
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time System Metrics</CardTitle>
              <CardDescription>
                Live monitoring of system resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realTimeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Line type="monotone" dataKey="network" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-sm">Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm">Network</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Times</CardTitle>
                <CardDescription>Average load times over 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="loadTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Concurrent users throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Performance
              </CardTitle>
              <CardDescription>
                Monitor API endpoint performance and error rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiPerformance.map((api) => (
                  <div key={api.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{api.endpoint}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{api.requests} requests</span>
                        <span>{api.avgResponseTime}ms avg</span>
                        <span className={api.errors > 0 ? 'text-red-600' : 'text-green-600'}>
                          {api.errors} errors
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={api.avgResponseTime > 200 ? 'destructive' : 'secondary'}>
                        {api.avgResponseTime}ms
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Health Status
              </CardTitle>
              <CardDescription>
                Monitor the health of all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {service.uptime}% | Last check: {service.lastCheck}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Last system check: 2 minutes ago
                  </p>
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Run Health Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};