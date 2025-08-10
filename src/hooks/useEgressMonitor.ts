import { useEffect, useRef } from 'react';

interface RequestMetrics {
  count: number;
  size: number;
  errors: number;
  lastReset: number;
}

const MONITOR_INTERVAL = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 50;
const MAX_SIZE_PER_MINUTE = 1024 * 1024; // 1MB

export const useEgressMonitor = () => {
  const metricsRef = useRef<RequestMetrics>({
    count: 0,
    size: 0,
    errors: 0,
    lastReset: Date.now()
  });

  const logRequest = (size: number, hasError: boolean = false) => {
    const metrics = metricsRef.current;
    metrics.count++;
    metrics.size += size;
    if (hasError) metrics.errors++;

    // Check thresholds
    if (metrics.count > MAX_REQUESTS_PER_MINUTE) {
      console.warn(`High request count: ${metrics.count}/minute`);
    }
    if (metrics.size > MAX_SIZE_PER_MINUTE) {
      console.warn(`High egress usage: ${(metrics.size / 1024 / 1024).toFixed(2)}MB/minute`);
    }
  };

  const getMetrics = () => metricsRef.current;

  const resetMetrics = () => {
    metricsRef.current = {
      count: 0,
      size: 0,
      errors: 0,
      lastReset: Date.now()
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Egress Metrics (last minute):', {
          requests: metrics.count,
          sizeKB: (metrics.size / 1024).toFixed(2),
          errors: metrics.errors,
          errorRate: metrics.count > 0 ? ((metrics.errors / metrics.count) * 100).toFixed(1) + '%' : '0%'
        });
      }

      resetMetrics();
    }, MONITOR_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { logRequest, getMetrics, resetMetrics };
};