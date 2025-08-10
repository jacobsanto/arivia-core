import { useEffect, useRef, useState } from 'react';

interface EgressMetrics {
  totalRequests: number;
  totalBytes: number;
  errors: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  peakUsageTime?: string;
}

interface RequestLog {
  timestamp: number;
  size: number;
  endpoint: string;
  success: boolean;
  responseTime: number;
  fromCache: boolean;
}

const MAX_LOG_ENTRIES = 1000;

export const useEgressAnalytics = () => {
  const [metrics, setMetrics] = useState<EgressMetrics>({
    totalRequests: 0,
    totalBytes: 0,
    errors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0
  });

  const requestLogs = useRef<RequestLog[]>([]);
  const metricsUpdateInterval = useRef<NodeJS.Timeout>();

  const logRequest = (params: {
    size: number;
    endpoint: string;
    success: boolean;
    responseTime: number;
    fromCache?: boolean;
  }) => {
    const log: RequestLog = {
      timestamp: Date.now(),
      ...params,
      fromCache: params.fromCache || false
    };

    requestLogs.current.push(log);

    // Keep only recent logs to prevent memory bloat
    if (requestLogs.current.length > MAX_LOG_ENTRIES) {
      requestLogs.current = requestLogs.current.slice(-MAX_LOG_ENTRIES);
    }
  };

  const calculateMetrics = () => {
    const logs = requestLogs.current;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Filter to last hour for real-time metrics
    const recentLogs = logs.filter(log => log.timestamp > oneHourAgo);

    if (recentLogs.length === 0) {
      return {
        totalRequests: 0,
        totalBytes: 0,
        errors: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgResponseTime: 0
      };
    }

    const totalRequests = recentLogs.length;
    const totalBytes = recentLogs.reduce((sum, log) => sum + log.size, 0);
    const errors = recentLogs.filter(log => !log.success).length;
    const cacheHits = recentLogs.filter(log => log.fromCache).length;
    const cacheMisses = totalRequests - cacheHits;
    const avgResponseTime = recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;

    // Find peak usage time (hour with most requests)
    const hourBuckets = new Map<number, number>();
    recentLogs.forEach(log => {
      const hour = Math.floor(log.timestamp / (60 * 60 * 1000));
      hourBuckets.set(hour, (hourBuckets.get(hour) || 0) + 1);
    });

    let peakHour = 0;
    let maxRequests = 0;
    hourBuckets.forEach((count, hour) => {
      if (count > maxRequests) {
        maxRequests = count;
        peakHour = hour;
      }
    });

    const peakUsageTime = new Date(peakHour * 60 * 60 * 1000).toLocaleTimeString();

    return {
      totalRequests,
      totalBytes,
      errors,
      cacheHits,
      cacheMisses,
      avgResponseTime: Math.round(avgResponseTime),
      peakUsageTime
    };
  };

  const getTopEndpoints = (limit: number = 5) => {
    const endpointStats = new Map<string, { count: number; bytes: number; errors: number }>();
    
    requestLogs.current.forEach(log => {
      const stats = endpointStats.get(log.endpoint) || { count: 0, bytes: 0, errors: 0 };
      stats.count++;
      stats.bytes += log.size;
      if (!log.success) stats.errors++;
      endpointStats.set(log.endpoint, stats);
    });

    return Array.from(endpointStats.entries())
      .sort((a, b) => b[1].bytes - a[1].bytes)
      .slice(0, limit)
      .map(([endpoint, stats]) => ({ endpoint, ...stats }));
  };

  const getErrorRateByHour = () => {
    const hourlyStats = new Map<number, { total: number; errors: number }>();
    
    requestLogs.current.forEach(log => {
      const hour = Math.floor(log.timestamp / (60 * 60 * 1000));
      const stats = hourlyStats.get(hour) || { total: 0, errors: 0 };
      stats.total++;
      if (!log.success) stats.errors++;
      hourlyStats.set(hour, stats);
    });

    return Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour: new Date(hour * 60 * 60 * 1000).toLocaleTimeString(),
        errorRate: stats.total > 0 ? (stats.errors / stats.total) * 100 : 0,
        totalRequests: stats.total
      }))
      .sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime());
  };

  const clearOldLogs = () => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    requestLogs.current = requestLogs.current.filter(log => log.timestamp > oneDayAgo);
  };

  useEffect(() => {
    // Update metrics every 30 seconds
    metricsUpdateInterval.current = setInterval(() => {
      setMetrics(calculateMetrics());
      clearOldLogs();
    }, 30000);

    // Initial calculation
    setMetrics(calculateMetrics());

    return () => {
      if (metricsUpdateInterval.current) {
        clearInterval(metricsUpdateInterval.current);
      }
    };
  }, []);

  return {
    metrics,
    logRequest,
    getTopEndpoints,
    getErrorRateByHour,
    clearLogs: () => {
      requestLogs.current = [];
      setMetrics(calculateMetrics());
    }
  };
};
