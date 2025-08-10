import { useCallback } from 'react';
import { useEgressAnalytics } from './useEgressAnalytics';
import { useEgressMonitor } from './useEgressMonitor';

export const useEgressIntegration = () => {
  const { logRequest: logAnalytics } = useEgressAnalytics();
  const { logRequest: logMonitor } = useEgressMonitor();

  const trackRequest = useCallback((params: {
    endpoint: string;
    size: number;
    success: boolean;
    responseTime: number;
    fromCache?: boolean;
  }) => {
    // Log to both monitoring systems
    logAnalytics(params);
    logMonitor(params.size, !params.success);
    
    // Console log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Egress] ${params.endpoint}: ${params.size} bytes, ${params.responseTime}ms, ${params.success ? 'success' : 'error'}`);
    }
  }, [logAnalytics, logMonitor]);

  const trackSupabaseRequest = useCallback(async <T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    fromCache: boolean = false
  ): Promise<T> => {
    const startTime = Date.now();
    let success = true;
    let result: T;
    
    try {
      result = await requestFn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = Date.now() - startTime;
      const estimatedSize = JSON.stringify(result || {}).length || 100; // Fallback size
      
      trackRequest({
        endpoint,
        size: estimatedSize,
        success,
        responseTime,
        fromCache
      });
    }
  }, [trackRequest]);

  return {
    trackRequest,
    trackSupabaseRequest
  };
};