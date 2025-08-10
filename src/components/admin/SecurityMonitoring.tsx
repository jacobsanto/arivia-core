import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw as Refresh
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  details: Record<string, any>;
  resolved: boolean;
  created_at: string;
}

interface SecurityDashboard {
  recent_security_events: SecurityEvent[];
  unresolved_events_count: number;
  critical_events_count: number;
  active_users_count: number;
  failed_login_attempts: number;
}

interface SystemHealth {
  database: {
    tables_count: number;
    active_connections: number;
    rls_enabled_tables: number;
  };
  authentication: {
    total_users: number;
    active_sessions: number;
  };
  integrations: {
    guesty_listings: number;
    guesty_bookings: number;
    last_sync: string;
  };
  performance: {
    avg_query_time: number;
    slow_queries_count: number;
  };
}

const SecurityMonitoring = () => {
  const [securityData, setSecurityData] = useState<SecurityDashboard | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleResolveEvent = async (eventId: string) => {
    try {
      // For now, just show a toast indicating this would resolve the event
      // In a real implementation, you would add a resolved field to the audit_logs table
      toast.success('Security event resolved');
      
      // Update local state to mark as resolved
      setSecurityData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          recent_security_events: prev.recent_security_events.map(event =>
            event.id === eventId ? { ...event, resolved: true } : event
          ),
          unresolved_events_count: Math.max(0, prev.unresolved_events_count - 1)
        };
      });
    } catch (error) {
      console.error('Error resolving event:', error);
      toast.error('Failed to resolve event');
    }
  };

  const fetchSecurityDashboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_security_dashboard');
      if (error) throw error;
      setSecurityData(data as unknown as SecurityDashboard);
    } catch (error: any) {
      console.error('Error fetching security dashboard:', error);
      if (error.message?.includes('Access denied')) {
        toast.error('Access denied: Requires superadmin privileges');
      } else {
        toast.error('Failed to load security dashboard');
      }
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_health');
      if (error) throw error;
      setSystemHealth(data as unknown as SystemHealth);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to load system health');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchSecurityDashboard(), fetchSystemHealth()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSecurityDashboard(), fetchSystemHealth()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getHealthScore = () => {
    if (!systemHealth) return 0;
    
    let score = 100;
    
    // Deduct points for performance issues
    if (systemHealth.performance.avg_query_time > 100) score -= 10;
    if (systemHealth.performance.slow_queries_count > 5) score -= 15;
    
    // Deduct points for security issues
    if (securityData?.unresolved_events_count > 0) score -= 20;
    if (securityData?.critical_events_count > 0) score -= 30;
    if (securityData?.failed_login_attempts > 10) score -= 15;
    
    return Math.max(0, score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor system security, performance, and user activity
          </p>
        </div>
        
        <Button onClick={refreshData} disabled={refreshing}>
          <Refresh className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-2xl font-bold">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {healthScore >= 90 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : healthScore >= 70 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Poor'}
                </span>
              </div>
              <div className="text-muted-foreground">
                RLS Tables: {systemHealth?.database.rls_enabled_tables || 0}
              </div>
              <div className="text-muted-foreground">
                Active Users: {securityData?.active_users_count || 0}
              </div>
              <div className="text-muted-foreground">
                Avg Query: {systemHealth?.performance.avg_query_time || 0}ms
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {securityData && (securityData.critical_events_count > 0 || securityData.unresolved_events_count > 5) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {securityData.critical_events_count > 0 && (
              <span className="text-destructive font-medium">
                {securityData.critical_events_count} critical security events require immediate attention. 
              </span>
            )}
            {securityData.unresolved_events_count > 5 && (
              <span>
                {securityData.unresolved_events_count} unresolved security events detected.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved Events</p>
                <p className="text-2xl font-bold">{securityData?.unresolved_events_count || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              {(securityData?.unresolved_events_count || 0) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  Requires attention
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  All resolved
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins (24h)</p>
                <p className="text-2xl font-bold">{securityData?.failed_login_attempts || 0}</p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              {(securityData?.failed_login_attempts || 0) > 10 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  High activity
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  Normal levels
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{systemHealth?.authentication.active_sessions || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              {securityData?.active_users_count || 0} active now
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security events and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData?.recent_security_events?.length ? (
              securityData.recent_security_events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getSeverityIcon(event.severity)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.event_type.replace(/_/g, ' ').toUpperCase()}</h4>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        {event.resolved && (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.details.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.details.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {!event.resolved && (
                    <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent security events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Tables</span>
                <span className="font-medium">{systemHealth?.database.tables_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">RLS Enabled</span>
                <span className="font-medium">{systemHealth?.database.rls_enabled_tables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Connections</span>
                <span className="font-medium">{systemHealth?.database.active_connections}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg Query Time</span>
                <span className="font-medium">{systemHealth?.performance.avg_query_time}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Slow Queries (1h)</span>
                <span className="font-medium">{systemHealth?.performance.slow_queries_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Users</span>
                <span className="font-medium">{systemHealth?.authentication.total_users}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityMonitoring;