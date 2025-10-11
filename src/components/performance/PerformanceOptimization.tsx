// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  Cpu,
  MemoryStick,
  Network,
  RefreshCw as Refresh,
  Settings as Optimize,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceMetric {
  id: string;
  query_type: string;
  table_name: string;
  execution_time_ms: number;
  created_at: string;
  metadata?: Record<string, any>;
}

interface PerformanceSummary {
  hour: string;
  query_type: string;
  table_name: string;
  query_count: number;
  avg_execution_time: number;
  max_execution_time: number;
  p95_execution_time: number;
}

const PerformanceOptimization = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('query_performance_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setMetrics((data || []).map(item => ({
        ...item,
        metadata: item.metadata as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      toast.error('Failed to load performance metrics');
    }
  }, []);

  const fetchPerformanceSummary = useCallback(async () => {
    try {
      // Use query_performance_log instead of the dropped performance_summary view
      const { data, error } = await supabase
        .from('query_performance_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24);
      
      if (error) throw error;
      
      // Transform the data to match PerformanceSummary format
      const transformedData = (data || []).map(item => ({
        hour: item.created_at,
        query_type: item.query_type,
        table_name: item.table_name,
        query_count: 1, // Default count
        avg_execution_time: item.execution_time_ms,
        max_execution_time: item.execution_time_ms,
        p95_execution_time: item.execution_time_ms
      }));
      
      setSummary(transformedData);
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      setSummary([]);
    }
  }, []);

  const runOptimization = useCallback(async () => {
    setOptimizing(true);
    try {
      // Run database optimization procedures
      const { error: cleanupError } = await supabase.rpc('cleanup_old_logs');
      if (cleanupError) throw cleanupError;

      const { error: maintenanceError } = await supabase.rpc('scheduled_maintenance');
      if (maintenanceError) throw maintenanceError;

      const { error: refreshError } = await supabase.rpc('refresh_performance_views');
      if (refreshError) throw refreshError;

      setLastOptimization(new Date());
      toast.success('System optimization completed successfully');
      
      // Refresh metrics after optimization
      await Promise.all([fetchPerformanceMetrics(), fetchPerformanceSummary()]);
    } catch (error: any) {
      console.error('Error running optimization:', error);
      toast.error(error.message || 'Failed to run optimization');
    } finally {
      setOptimizing(false);
    }
  }, [fetchPerformanceMetrics, fetchPerformanceSummary]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPerformanceMetrics(), fetchPerformanceSummary()]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchPerformanceMetrics, fetchPerformanceSummary]);

  const getPerformanceScore = () => {
    if (!metrics.length) return 100;
    
    const avgTime = metrics.reduce((sum, m) => sum + m.execution_time_ms, 0) / metrics.length;
    const slowQueries = metrics.filter(m => m.execution_time_ms > 1000).length;
    const slowQueryRatio = slowQueries / metrics.length;
    
    let score = 100;
    if (avgTime > 100) score -= 20;
    if (avgTime > 500) score -= 30;
    if (slowQueryRatio > 0.1) score -= 30;
    if (slowQueryRatio > 0.2) score -= 20;
    
    return Math.max(0, score);
  };

  const getTopSlowQueries = () => {
    return metrics
      .filter(m => m.execution_time_ms > 100)
      .sort((a, b) => b.execution_time_ms - a.execution_time_ms)
      .slice(0, 10);
  };

  const getQueryTypeStats = () => {
    const stats = metrics.reduce((acc, metric) => {
      const type = metric.query_type || 'unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, totalTime: 0, maxTime: 0 };
      }
      acc[type].count++;
      acc[type].totalTime += metric.execution_time_ms;
      acc[type].maxTime = Math.max(acc[type].maxTime, metric.execution_time_ms);
      return acc;
    }, {} as Record<string, { count: number; totalTime: number; maxTime: number }>);

    return Object.entries(stats)
      .map(([type, data]) => ({
        type,
        count: data.count,
        avgTime: Math.round(data.totalTime / data.count),
        maxTime: data.maxTime
      }))
      .sort((a, b) => b.avgTime - a.avgTime);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const performanceScore = getPerformanceScore();
  const slowQueries = getTopSlowQueries();
  const queryStats = getQueryTypeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Optimization</h2>
          <p className="text-muted-foreground">
            Monitor and optimize system performance and database efficiency
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => Promise.all([fetchPerformanceMetrics(), fetchPerformanceSummary()])} variant="outline">
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runOptimization} disabled={optimizing}>
            <Optimize className={`h-4 w-4 mr-2 ${optimizing ? 'animate-spin' : ''}`} />
            {optimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Performance</span>
              <span className="text-2xl font-bold">{performanceScore}%</span>
            </div>
            <Progress value={performanceScore} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {performanceScore >= 90 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : performanceScore >= 70 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
              <div className="text-muted-foreground">
                Avg Query: {metrics.length ? Math.round(metrics.reduce((sum, m) => sum + m.execution_time_ms, 0) / metrics.length) : 0}ms
              </div>
              <div className="text-muted-foreground">
                Slow Queries: {slowQueries.length}
              </div>
              <div className="text-muted-foreground">
                Total Queries: {metrics.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      {lastOptimization && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Last optimization completed {lastOptimization.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {metrics.length ? Math.round(metrics.reduce((sum, m) => sum + m.execution_time_ms, 0) / metrics.length) : 0}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slow Queries</p>
                <p className="text-2xl font-bold">{slowQueries.length}</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Response</p>
                <p className="text-2xl font-bold">
                  {metrics.length ? Math.max(...metrics.map(m => m.execution_time_ms)) : 0}ms
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Query Types</p>
                <p className="text-2xl font-bold">{queryStats.length}</p>
              </div>
              <Cpu className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Query Type Performance</CardTitle>
          <CardDescription>
            Performance breakdown by query type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queryStats.map((stat) => (
              <div key={stat.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{stat.type}</Badge>
                  <div>
                    <p className="font-medium">{stat.count} queries</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: {stat.avgTime}ms • Max: {stat.maxTime}ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stat.avgTime > 500 ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : stat.avgTime > 100 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slow Queries */}
      {slowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Slow Queries</CardTitle>
            <CardDescription>
              Queries taking longer than 100ms that may need optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slowQueries.map((query) => (
                <div key={query.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{query.execution_time_ms}ms</Badge>
                      <span className="font-medium">{query.query_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Table: {query.table_name || 'N/A'} • {new Date(query.created_at).toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Suggested actions to improve system performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slowQueries.length > 5 && (
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">High number of slow queries detected</p>
                  <p className="text-sm text-muted-foreground">
                    Consider adding database indexes or optimizing query patterns
                  </p>
                </div>
              </div>
            )}
            
            {performanceScore < 70 && (
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Poor performance detected</p>
                  <p className="text-sm text-muted-foreground">
                    Run system optimization or review database configuration
                  </p>
                </div>
              </div>
            )}
            
            {!lastOptimization && (
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Run system optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Clean up old logs and refresh performance statistics
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimization;