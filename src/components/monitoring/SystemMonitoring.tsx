import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  responseTime: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

const SystemMonitoring = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: '0d 0h 0m',
    responseTime: 0
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'database',
      name: 'Supabase Database',
      status: 'healthy',
      responseTime: 45,
      lastCheck: new Date(),
      uptime: 99.9
    },
    {
      id: 'auth',
      name: 'Authentication Service',
      status: 'healthy',
      responseTime: 32,
      lastCheck: new Date(),
      uptime: 99.8
    },
    {
      id: 'guesty',
      name: 'Guesty Integration',
      status: 'warning',
      responseTime: 180,
      lastCheck: new Date(),
      uptime: 98.5
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'healthy',
      responseTime: 28,
      lastCheck: new Date(),
      uptime: 99.9
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, Math.min(1000, prev.network + (Math.random() - 0.5) * 50)),
        uptime: '12d 4h 32m',
        responseTime: Math.max(10, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 20))
      }));
    }, 3000);

    // Initialize with realistic values
    setMetrics({
      cpu: 35 + Math.random() * 20,
      memory: 45 + Math.random() * 15,
      disk: 25 + Math.random() * 10,
      network: 150 + Math.random() * 100,
      uptime: '12d 4h 32m',
      responseTime: 85 + Math.random() * 30
    });

    return () => clearInterval(interval);
  }, []);

  const refreshServices = async () => {
    setIsRefreshing(true);
    
    // Simulate service health checks
    setTimeout(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 20),
        lastCheck: new Date(),
        status: Math.random() > 0.9 ? 'warning' : 'healthy'
      })));
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="services">Service Health</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${metrics.cpu}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.memory.toFixed(1)}%</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${metrics.memory}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wifi className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Network</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.network.toFixed(0)} MB/s</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (metrics.network / 1000) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Response Time</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.responseTime.toFixed(0)}ms</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (metrics.responseTime / 500) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">System Information</h3>
                    <Badge variant="secondary">Production</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <div className="font-medium">{metrics.uptime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Disk Usage:</span>
                      <div className="font-medium">{metrics.disk.toFixed(1)}% of 500GB</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Users:</span>
                      <div className="font-medium">24 online</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Service Health Status</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshServices}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {services.map(service => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Last checked: {service.lastCheck.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={service.status === 'healthy' ? 'default' : 'destructive'}
                            className={service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                          >
                            {service.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {service.responseTime}ms • {service.uptime}% uptime
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Application Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Page Load Time</span>
                          <span className="text-sm font-medium">1.2s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">API Response Time</span>
                          <span className="text-sm font-medium">450ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Database Query Time</span>
                          <span className="text-sm font-medium">125ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Bundle Size</span>
                          <span className="text-sm font-medium">2.1MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Resource Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm font-medium">245MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cache Hit Rate</span>
                          <span className="text-sm font-medium">94.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Error Rate</span>
                          <span className="text-sm font-medium">0.05%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Active Connections</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;