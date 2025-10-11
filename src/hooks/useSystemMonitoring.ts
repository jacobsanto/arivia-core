// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/services/logger';

interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff: 'fixed' | 'exponential';
}

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  interval: number;
  retryOptions?: RetryOptions;
}

export function useSystemMonitoring() {
  const [healthChecks, setHealthChecks] = useState<Map<string, boolean>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    delay: 1000,
    backoff: 'exponential'
  };

  const executeWithRetry = async (
    fn: () => Promise<boolean>,
    options: RetryOptions = defaultRetryOptions
  ): Promise<boolean> => {
    let attempt = 0;
    
    while (attempt <= options.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        
        if (attempt > options.maxRetries) {
          logger.error(`Health check failed after ${options.maxRetries} retries`, error);
          return false;
        }
        
        const delay = options.backoff === 'exponential' 
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  };

  const runHealthCheck = async (healthCheck: HealthCheck) => {
    const isHealthy = await executeWithRetry(healthCheck.check, healthCheck.retryOptions);
    
    setHealthChecks(prev => {
      const newMap = new Map(prev);
      const wasHealthy = newMap.get(healthCheck.name);
      newMap.set(healthCheck.name, isHealthy);
      
      // Notify on status change
      if (wasHealthy !== undefined && wasHealthy !== isHealthy) {
        if (isHealthy) {
          toast.success(`${healthCheck.name} recovered`, {
            description: 'System component is now healthy'
          });
        } else {
          toast.error(`${healthCheck.name} failed`, {
            description: 'System component health check failed'
          });
        }
      }
      
      return newMap;
    });
    
    return isHealthy;
  };

  const startMonitoring = (checks: HealthCheck[]) => {
    if (isMonitoring) {
      stopMonitoring();
    }
    
    setIsMonitoring(true);
    
    checks.forEach(check => {
      // Run initial check
      runHealthCheck(check);
      
      // Set up interval for periodic checks
      const interval = setInterval(() => {
        runHealthCheck(check);
      }, check.interval);
      
      intervalsRef.current.set(check.name, interval);
    });
  };

  const stopMonitoring = () => {
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current.clear();
    setIsMonitoring(false);
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  return {
    healthChecks,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    runHealthCheck
  };
}

// Predefined health checks
export const systemHealthChecks: HealthCheck[] = [
  {
    name: 'Database Connection',
    check: async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    },
    interval: 30000, // 30 seconds
    retryOptions: {
      maxRetries: 2,
      delay: 1000,
      backoff: 'exponential'
    }
  },
  {
    name: 'Authentication Service',
    check: async () => {
      const { data, error } = await supabase.auth.getSession();
      return !error;
    },
    interval: 60000, // 1 minute
    retryOptions: {
      maxRetries: 2,
      delay: 500,
      backoff: 'fixed'
    }
  },
  {
    name: 'Chat System',
    check: async () => {
      const { error } = await supabase.from('chat_channels').select('id').limit(1);
      return !error;
    },
    interval: 45000, // 45 seconds
  },
  {
    name: 'Guesty Integration',
    check: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('guesty-auth-check');
        return !error && data?.success;
      } catch (error) {
        return false;
      }
    },
    interval: 300000, // 5 minutes
    retryOptions: {
      maxRetries: 1,
      delay: 2000,
      backoff: 'fixed'
    }
  },
  {
    name: 'Performance Monitoring',
    check: async () => {
      const { data, error } = await supabase
        .from('query_performance_log')
        .select('id')
        .limit(1);
      return !error;
    },
    interval: 120000, // 2 minutes
  }
];