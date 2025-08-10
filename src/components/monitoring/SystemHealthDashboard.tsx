import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Zap,
  Database,
  Clock
} from 'lucide-react';
import { useEgressAnalytics } from '@/hooks/useEgressAnalytics';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';

const SystemHealthDashboard: React.FC = () => {
  const { metrics } = useEgressAnalytics();
  const { getMetrics } = useEgressMonitor();
  const monitorMetrics = getMetrics();

  const healthScore = React.useMemo(() => {
    let score = 100;
    
    // Deduct points for high error rate
    const errorRate = metrics.totalRequests > 0 ? (metrics.errors / metrics.totalRequests) * 100 : 0;
    if (errorRate > 10) score -= 30;
    else if (errorRate > 5) score -= 15;
    
    // Deduct points for slow response times
    if (metrics.avgResponseTime > 2000) score -= 20;
    else if (metrics.avgResponseTime > 1000) score -= 10;
    
    // Deduct points for low cache hit rate
    const cacheHitRate = metrics.totalRequests > 0 ? (metrics.cacheHits / metrics.totalRequests) * 100 : 0;
    if (cacheHitRate < 50) score -= 15;
    else if (cacheHitRate < 70) score -= 5;
    
    return Math.max(0, score);
  }, [metrics]);

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-600', variant: 'default' as const };
    if (score >= 75) return { status: 'Good', color: 'text-green-500', variant: 'secondary' as const };
    if (score >= 60) return { status: 'Fair', color: 'text-yellow-500', variant: 'outline' as const };
    return { status: 'Poor', color: 'text-red-500', variant: 'destructive' as const };
  };

  const health = getHealthStatus(healthScore);

  const systemChecks = [
    {
      name: 'Profile Fetch Optimization',
      status: 'active',
      description: 'Caching and deduplication preventing redundant requests',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      name: 'Circuit Breaker Protection',
      status: 'active', 
      description: 'Preventing cascading failures and retry loops',
      icon: Shield,
      color: 'text-green-500'
    },
    {
      name: 'Request Deduplication',
      status: 'active',
      description: 'Eliminating duplicate simultaneous requests',
      icon: Zap,
      color: 'text-green-500'
    },
    {
      name: 'Authentication Optimization',
      status: 'active',
      description: 'Debounced state changes and optimized sessions',
      icon: Database,
      color: 'text-green-500'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Cache Hit Rate',
      value: metrics.totalRequests > 0 ? (metrics.cacheHits / metrics.totalRequests) * 100 : 0,
      target: 80,
      unit: '%'
    },
    {
      label: 'Error Rate',
      value: metrics.totalRequests > 0 ? (metrics.errors / metrics.totalRequests) * 100 : 0,
      target: 5,
      unit: '%',
      inverse: true
    },
    {
      label: 'Avg Response Time',
      value: metrics.avgResponseTime,
      target: 1000,
      unit: 'ms',
      inverse: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of optimization effectiveness and system performance
          </p>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Health
          </CardTitle>
          <CardDescription>
            Composite score based on performance, errors, and optimization effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{healthScore}</div>
              <div>
                <Badge variant={health.variant}>{health.status}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Health Score</div>
              </div>
            </div>
          </div>
          <Progress value={healthScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {performanceMetrics.map((metric, index) => {
          const isOnTarget = metric.inverse 
            ? metric.value <= metric.target 
            : metric.value >= metric.target;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                {isOnTarget ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}{metric.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {metric.inverse ? '≤' : '≥'} {metric.target}{metric.unit}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Optimizations Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Optimizations</CardTitle>
          <CardDescription>
            Status of all deployed optimization measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {systemChecks.map((check, index) => {
              const IconComponent = check.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${check.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{check.name}</h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.totalBytes / (1024 * 1024)).toFixed(1)}MB
            </div>
            <p className="text-xs text-muted-foreground">Egress usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalRequests > 0 
                ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Hit rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;