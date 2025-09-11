import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  HardDrive
} from 'lucide-react';
import { useCache } from '@/contexts/CacheContext';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { logger } from '@/services/logger';

// Offline status indicator
export const OfflineIndicator: React.FC = () => {
  const { isOnline, syncQueue, getCacheStats } = useCache();
  const [showDetails, setShowDetails] = React.useState(false);
  const cacheStats = getCacheStats();

  if (isOnline && syncQueue.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 transition-all duration-300 ${!isOnline ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-blue-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
              
              <div>
                <CardTitle className="text-sm">
                  {isOnline ? 'Syncing Changes' : 'Offline Mode'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isOnline 
                    ? `${syncQueue.length} changes pending`
                    : 'Changes will sync when online'
                  }
                </CardDescription>
              </div>
            </div>

            <Badge variant={isOnline ? 'secondary' : 'outline'} className="text-xs">
              {syncQueue.length} queued
            </Badge>
          </div>
        </CardHeader>

        {syncQueue.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {Math.max(0, 10 - syncQueue.length)}/10 synced
                </span>
              </div>
              
              <Progress 
                value={Math.max(0, (10 - syncQueue.length) / 10 * 100)} 
                className="h-2"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>

              {showDetails && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cache entries:</span>
                    <span className="font-medium">{cacheStats.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last sync:</span>
                    <span className="font-medium">
                      {cacheStats.lastSync ? 
                        new Date(cacheStats.lastSync).toLocaleTimeString() : 
                        'Never'
                      }
                    </span>
                  </div>

                  {syncQueue.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <div className="text-muted-foreground mb-1">Pending operations:</div>
                      {syncQueue.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full" />
                          <span className="capitalize">{item.operation}</span>
                          <span className="text-muted-foreground">{item.table}</span>
                        </div>
                      ))}
                      {syncQueue.length > 3 && (
                        <div className="text-muted-foreground">
                          +{syncQueue.length - 3} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Performance metrics display
export const PerformanceMetrics: React.FC<{ visible?: boolean }> = ({ visible = false }) => {
  const [metrics, setMetrics] = React.useState({
    memory: 0,
    renderTime: 0,
    cacheHitRate: 0,
    bundleSize: 0,
  });

  React.useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => {
      try {
        const memory = (performance as any).memory?.usedJSHeapSize || 0;
        const renderStart = performance.now();
        
        // Simulate render time measurement
        requestIdleCallback(() => {
          const renderTime = performance.now() - renderStart;
          
          setMetrics(prev => ({
            ...prev,
            memory: Math.round(memory / 1024 / 1024), // MB
            renderTime: Math.round(renderTime * 100) / 100,
          }));
        });
      } catch (error) {
        logger.error('Failed to update performance metrics', error);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || import.meta.env.PROD) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-64 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            Performance
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-muted-foreground" />
              <div>
                <div className="font-medium">{metrics.memory}MB</div>
                <div className="text-muted-foreground">Memory</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <div>
                <div className="font-medium">{metrics.renderTime}ms</div>
                <div className="text-muted-foreground">Render</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-muted-foreground" />
              <div>
                <div className="font-medium">{metrics.cacheHitRate}%</div>
                <div className="text-muted-foreground">Cache Hit</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <div>
                <div className="font-medium">Optimal</div>
                <div className="text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// App health monitor
export const AppHealthMonitor: React.FC = () => {
  const { isOnline, getCacheStats } = useCache();
  const [health, setHealth] = React.useState({
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    lastCheck: Date.now(),
  });

  React.useEffect(() => {
    const checkHealth = () => {
      const issues: string[] = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check connection
      if (!isOnline) {
        issues.push('No internet connection');
        status = 'warning';
      }

      // Check memory usage
      if ((performance as any).memory?.usedJSHeapSize > 100 * 1024 * 1024) {
        issues.push('High memory usage');
        if (status === 'healthy') status = 'warning';
      }

      // Check cache size
      const cacheStats = getCacheStats();
      if (cacheStats.size > 1000) {
        issues.push('Large cache size');
        if (status === 'healthy') status = 'warning';
      }

      // Check for errors in the last 5 minutes
      const recentErrors = localStorage.getItem('recent_errors');
      if (recentErrors) {
        try {
          const errors = JSON.parse(recentErrors);
          if (errors.length > 5) {
            issues.push('Multiple recent errors');
            status = 'critical';
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      setHealth({
        status,
        issues,
        lastCheck: Date.now(),
      });

      logger.debug('App health check completed', { status, issues });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isOnline, getCacheStats]);

  // Only show if there are issues
  if (health.status === 'healthy') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className={`w-72 ${
        health.status === 'critical' 
          ? 'border-red-200 bg-red-50' 
          : 'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${
              health.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            App Health
            <Badge variant={health.status === 'critical' ? 'destructive' : 'secondary'}>
              {health.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            {health.issues.map((issue, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  health.status === 'critical' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};