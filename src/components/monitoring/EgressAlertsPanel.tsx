import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle, XCircle, Bell, BellOff } from 'lucide-react';
import { useEgressAnalytics } from '@/hooks/useEgressAnalytics';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';
import { toastService } from '@/services/toast';

interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  enabled: boolean;
  lastTriggered?: number;
  cooldown: number; // milliseconds
}

const EgressAlertsPanel: React.FC = () => {
  const { metrics } = useEgressAnalytics();
  const { getMetrics } = useEgressMonitor();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  const alertRules: AlertRule[] = [
    {
      id: 'high-egress',
      name: 'High Egress Usage',
      condition: (m) => (m.totalBytes / (1024 * 1024)) > 50, // 50MB per hour
      severity: 'warning',
      message: 'Egress usage is above 50MB per hour',
      enabled: true,
      cooldown: 5 * 60 * 1000 // 5 minutes
    },
    {
      id: 'critical-egress',
      name: 'Critical Egress Usage',
      condition: (m) => (m.totalBytes / (1024 * 1024)) > 100, // 100MB per hour
      severity: 'critical',
      message: 'Egress usage is above 100MB per hour - immediate action required',
      enabled: true,
      cooldown: 2 * 60 * 1000 // 2 minutes
    },
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (m) => m.totalRequests > 10 && (m.errors / m.totalRequests) > 0.1, // 10% error rate
      severity: 'warning',
      message: 'Error rate is above 10%',
      enabled: true,
      cooldown: 3 * 60 * 1000 // 3 minutes
    },
    {
      id: 'low-cache-efficiency',
      name: 'Low Cache Efficiency',
      condition: (m) => m.totalRequests > 20 && (m.cacheHits / m.totalRequests) < 0.5, // Less than 50% cache hits
      severity: 'info',
      message: 'Cache efficiency is below 50% - consider optimizing cache settings',
      enabled: true,
      cooldown: 10 * 60 * 1000 // 10 minutes
    },
    {
      id: 'slow-response-time',
      name: 'Slow Response Time',
      condition: (m) => m.avgResponseTime > 1000, // 1 second average
      severity: 'warning',
      message: 'Average response time is above 1 second',
      enabled: true,
      cooldown: 5 * 60 * 1000 // 5 minutes
    },
    {
      id: 'rapid-requests',
      name: 'Rapid Request Rate',
      condition: () => {
        const current = getMetrics();
        return current.count > 30; // More than 30 requests per minute
      },
      severity: 'warning',
      message: 'Request rate is above 30 per minute',
      enabled: true,
      cooldown: 2 * 60 * 1000 // 2 minutes
    }
  ];

  const checkAlerts = () => {
    if (!alertsEnabled) return;

    const now = Date.now();
    const newActiveAlerts: string[] = [];

    alertRules.forEach(rule => {
      if (!rule.enabled) return;
      
      // Check cooldown
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldown) {
        if (activeAlerts.includes(rule.id)) {
          newActiveAlerts.push(rule.id);
        }
        return;
      }

      const triggered = rule.condition(metrics);
      
      if (triggered) {
        newActiveAlerts.push(rule.id);
        
        // Only show toast/notification if this is a new alert
        if (!activeAlerts.includes(rule.id)) {
          rule.lastTriggered = now;
          
          // Show appropriate notification
          switch (rule.severity) {
            case 'critical':
              toastService.error("Critical Alert", { description: rule.message });
              break;
            case 'warning':
              toastService.warning("Warning", { description: rule.message });
              break;
            case 'info':
              toastService.info("Info", { description: rule.message });
              break;
          }
        }
      }
    });

    setActiveAlerts(newActiveAlerts);
  };

  useEffect(() => {
    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [alertsEnabled, activeAlerts, metrics]);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Egress Monitoring Alerts</CardTitle>
              <CardDescription>
                Real-time monitoring and alerting for egress usage patterns
              </CardDescription>
            </div>
            <Button
              variant={alertsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAlertsEnabled(!alertsEnabled)}
            >
              {alertsEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
              {alertsEnabled ? 'Alerts On' : 'Alerts Off'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
            </span>
            <Badge variant={activeAlerts.length > 0 ? "destructive" : "secondary"}>
              {activeAlerts.length > 0 ? "Issues Detected" : "All Clear"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {alertRules
            .filter(rule => activeAlerts.includes(rule.id))
            .map(rule => (
              <Alert key={rule.id} variant={getAlertVariant(rule.severity)}>
                {getAlertIcon(rule.severity)}
                <AlertTitle className="flex items-center justify-between">
                  {rule.name}
                  <Badge variant="outline">{rule.severity}</Badge>
                </AlertTitle>
                <AlertDescription>{rule.message}</AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Alert Rules Status */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>Configure monitoring thresholds and conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(rule.severity)}
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">{rule.message}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{rule.severity}</Badge>
                  <Badge variant={activeAlerts.includes(rule.id) ? "destructive" : "secondary"}>
                    {activeAlerts.includes(rule.id) ? "Active" : "Ok"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Emergency actions to reduce egress usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Clear analytics logs to reduce memory usage
                const { clearLogs } = useEgressAnalytics();
                clearLogs();
                toastService.success("Analytics logs cleared");
              }}
            >
              Clear Analytics Logs
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Reset monitoring metrics
                const { resetMetrics } = useEgressMonitor();
                resetMetrics();
                toastService.success("Monitoring metrics reset");
              }}
            >
              Reset Monitoring
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Force cache clear (this would need to be implemented in cache utilities)
                toastService.info("Cache clear requested", {
                  description: "This would clear all cached data to reduce memory usage"
                });
              }}
            >
              Clear All Caches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EgressAlertsPanel;