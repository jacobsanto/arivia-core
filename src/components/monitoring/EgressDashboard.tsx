import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Activity, Database, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useEgressAnalytics } from '@/hooks/useEgressAnalytics';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';

const EgressDashboard: React.FC = () => {
  const { metrics, getTopEndpoints, getErrorRateByHour } = useEgressAnalytics();
  const { getMetrics } = useEgressMonitor();
  
  const currentMetrics = getMetrics();
  const topEndpoints = getTopEndpoints(5);
  const errorRates = getErrorRateByHour();
  
  // Calculate cache efficiency
  const cacheEfficiency = metrics.totalRequests > 0 
    ? (metrics.cacheHits / metrics.totalRequests) * 100 
    : 0;
  
  // Determine egress status
  const getEgressStatus = () => {
    const mbUsed = metrics.totalBytes / (1024 * 1024);
    if (mbUsed > 100) return { status: 'critical', color: 'destructive' };
    if (mbUsed > 50) return { status: 'warning', color: 'warning' };
    return { status: 'healthy', color: 'success' };
  };
  
  const egressStatus = getEgressStatus();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Real-time Egress Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egress Usage (1h)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.totalBytes / (1024 * 1024)).toFixed(2)} MB
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={egressStatus.color as any}>
              {egressStatus.status}
            </Badge>
            <Progress 
              value={Math.min((metrics.totalBytes / (100 * 1024 * 1024)) * 100, 100)} 
              className="flex-1" 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.totalRequests} requests
          </p>
        </CardContent>
      </Card>

      {/* Cache Efficiency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cacheEfficiency.toFixed(1)}%</div>
          <Progress value={cacheEfficiency} className="mt-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Hits: {metrics.cacheHits}</span>
            <span>Misses: {metrics.cacheMisses}</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
          <div className="flex items-center mt-2">
            {metrics.avgResponseTime < 500 ? (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
            )}
            <span className="text-xs text-muted-foreground">
              {metrics.avgResponseTime < 500 ? 'Optimal' : 'Needs attention'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalRequests > 0 
              ? ((metrics.errors / metrics.totalRequests) * 100).toFixed(1)
              : 0
            }%
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.errors} errors out of {metrics.totalRequests} requests
          </p>
          {metrics.errors > 0 && (
            <Badge variant="destructive" className="mt-2">
              Requires attention
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Top Endpoints by Bandwidth */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Endpoints by Bandwidth</CardTitle>
          <CardDescription>Highest egress usage in the last hour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEndpoints.map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {endpoint.endpoint}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(endpoint.bytes / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {endpoint.count} requests
                    {endpoint.errors > 0 && (
                      <span className="text-red-500 ml-1">
                        ({endpoint.errors} errors)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {topEndpoints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Rate by Hour */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Error Rate Timeline</CardTitle>
          <CardDescription>Error percentage by hour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {errorRates.slice(-6).map((hourData, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{hourData.hour}</span>
                <div className="flex items-center space-x-2 flex-1 ml-4">
                  <Progress 
                    value={hourData.errorRate} 
                    className="flex-1 max-w-[100px]" 
                  />
                  <span className="text-sm font-medium min-w-[40px]">
                    {hourData.errorRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({hourData.totalRequests} req)
                  </span>
                </div>
              </div>
            ))}
            {errorRates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No historical data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Minute Metrics */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Real-time Metrics (Current Minute)</CardTitle>
          <CardDescription>Live monitoring from useEgressMonitor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentMetrics.count}</div>
              <div className="text-sm text-muted-foreground">Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(currentMetrics.size / 1024).toFixed(1)} KB
              </div>
              <div className="text-sm text-muted-foreground">Data Transfer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentMetrics.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentMetrics.count > 0 
                  ? ((currentMetrics.errors / currentMetrics.count) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EgressDashboard;