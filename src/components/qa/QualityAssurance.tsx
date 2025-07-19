import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Database,
  Server,
  Network,
  Eye
} from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
  details: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface QualityMetric {
  name: string;
  score: number;
  target: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  description: string;
}

const QualityAssurance = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      name: 'Frontend Application',
      status: 'healthy',
      responseTime: 245,
      lastCheck: new Date(),
      uptime: 99.9,
      details: 'All systems operational'
    },
    {
      name: 'Supabase Database',
      status: 'healthy',
      responseTime: 89,
      lastCheck: new Date(),
      uptime: 99.95,
      details: 'Connection pool healthy'
    },
    {
      name: 'Guesty API',
      status: 'warning',
      responseTime: 1250,
      lastCheck: new Date(),
      uptime: 98.2,
      details: 'Rate limiting detected'
    },
    {
      name: 'Authentication Service',
      status: 'healthy',
      responseTime: 156,
      lastCheck: new Date(),
      uptime: 99.8,
      details: 'JWT validation working'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      responseTime: 78,
      lastCheck: new Date(),
      uptime: 99.9,
      details: 'Upload/download operational'
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High API Response Time',
      message: 'Guesty API response time exceeded 1 second threshold',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      acknowledged: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database maintenance scheduled for tonight at 2:00 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      acknowledged: true
    },
    {
      id: '3',
      type: 'error',
      title: 'Failed Sync Operation',
      message: 'Booking sync failed for property LX-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      acknowledged: false
    }
  ]);

  const qualityMetrics: QualityMetric[] = [
    {
      name: 'Code Coverage',
      score: 82,
      target: 80,
      status: 'excellent',
      description: 'Percentage of code covered by automated tests'
    },
    {
      name: 'Performance Score',
      score: 89,
      target: 85,
      status: 'excellent',
      description: 'Overall application performance rating'
    },
    {
      name: 'Security Score',
      score: 94,
      target: 90,
      status: 'excellent',
      description: 'Security vulnerability assessment score'
    },
    {
      name: 'Accessibility Score',
      score: 76,
      target: 80,
      status: 'needs-improvement',
      description: 'Web accessibility compliance rating'
    },
    {
      name: 'Error Rate',
      score: 0.2,
      target: 1.0,
      status: 'excellent',
      description: 'Percentage of requests resulting in errors'
    },
    {
      name: 'User Satisfaction',
      score: 4.6,
      target: 4.0,
      status: 'excellent',
      description: 'Average user rating out of 5'
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthChecks(prev => prev.map(check => ({
        ...check,
        responseTime: Math.max(10, check.responseTime + (Math.random() - 0.5) * 50),
        lastCheck: new Date()
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMetricStatus = (metric: QualityMetric) => {
    if (metric.name === 'Error Rate') {
      return metric.score <= metric.target ? 'excellent' : 'needs-improvement';
    }
    return metric.score >= metric.target ? 'excellent' : 'needs-improvement';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const runHealthCheck = () => {
    setHealthChecks(prev => prev.map(check => ({
      ...check,
      lastCheck: new Date(),
      responseTime: Math.max(10, Math.random() * 500)
    })));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quality Assurance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="health">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
              <TabsTrigger value="alerts">Alerts & Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">System Health Checks</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time monitoring of critical system components
                  </p>
                </div>
                <Button onClick={runHealthCheck}>
                  <Activity className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthChecks.map((check, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{check.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{check.uptime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium">
                            {check.lastCheck.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">{check.details}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Server className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Servers</div>
                      <div className="text-sm text-muted-foreground">3/3 Online</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Database className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Database</div>
                      <div className="text-sm text-muted-foreground">Healthy</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Network className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Network</div>
                      <div className="text-sm text-muted-foreground">Optimal</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <div className="font-medium">Performance</div>
                      <div className="text-sm text-muted-foreground">Excellent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Quality Metrics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track and monitor key quality indicators for the application
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualityMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{metric.name}</h4>
                        <Badge className={
                          getMetricStatus(metric) === 'excellent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {getMetricStatus(metric) === 'excellent' ? 'Excellent' : 'Needs Improvement'}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className={`font-bold text-lg ${getMetricColor(getMetricStatus(metric))}`}>
                            {metric.name === 'User Satisfaction' ? `${metric.score}/5` : 
                             metric.name === 'Error Rate' ? `${metric.score}%` : 
                             `${metric.score}${metric.name.includes('Score') ? '' : '%'}`}
                          </span>
                        </div>
                        <Progress 
                          value={metric.name === 'Error Rate' ? 
                            Math.max(0, 100 - (metric.score / metric.target) * 100) :
                            (metric.score / (metric.name === 'User Satisfaction' ? 5 : 100)) * 100
                          } 
                          className="h-2" 
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Target: {metric.name === 'User Satisfaction' ? `${metric.target}/5` : 
                                         metric.name === 'Error Rate' ? `<${metric.target}%` : 
                                         `${metric.target}${metric.name.includes('Score') ? '' : '%'}`}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">System Alerts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor and manage system alerts and notifications
                </p>
              </div>

              <div className="space-y-3">
                {alerts.map(alert => (
                  <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {alert.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.type === 'error' ? 'destructive' : 
                            alert.type === 'warning' ? 'secondary' : 'default'
                          }>
                            {alert.type}
                          </Badge>
                          {!alert.acknowledged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {alert.acknowledged && (
                            <Badge variant="outline">Acknowledged</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monitoring Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Alert Thresholds</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Response Time:</span>
                          <span>{'>'} 1000ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span>{'>'} 1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span>{'>'} 85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disk Space:</span>
                          <span>{'>'} 90%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Notification Channels</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Email Alerts:</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex justify-between">
                          <span>Slack Notifications:</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex justify-between">
                          <span>SMS Alerts:</span>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex justify-between">
                          <span>Dashboard Alerts:</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
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

export default QualityAssurance;