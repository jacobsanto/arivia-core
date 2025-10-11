import React from "react";
import { Shield, AlertTriangle, Activity, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { Separator } from "@/components/ui/separator";

const SecurityDashboard: React.FC = () => {
  const { 
    securityDashboard, 
    systemHealth, 
    loading, 
    error, 
    healthScore, 
    refreshAll,
    resolveSecurityEvent 
  } = useSecurityMonitoring();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Health Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Health Score
            </span>
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Overall security posture assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}/100
            </div>
            <div className="flex-1">
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    healthScore >= 95 ? 'bg-green-500' : 
                    healthScore >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {healthScore >= 95 ? 'Excellent security posture' :
                 healthScore >= 85 ? 'Good security with minor issues' :
                 'Security improvements needed'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{securityDashboard?.unresolved_events_count || 0}</p>
                <p className="text-sm text-muted-foreground">Unresolved Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{securityDashboard?.critical_events_count || 0}</p>
                <p className="text-sm text-muted-foreground">Critical Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{securityDashboard?.active_users_count || 0}</p>
                <p className="text-sm text-muted-foreground">Active Users (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{securityDashboard?.failed_login_attempts || 0}</p>
                <p className="text-sm text-muted-foreground">Failed Logins (1h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security incidents and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {securityDashboard?.recent_security_events && securityDashboard.recent_security_events.length > 0 ? (
            <div className="space-y-4">
              {securityDashboard.recent_security_events.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.event_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.resolved ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => resolveSecurityEvent(event.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recent security events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Database and infrastructure status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Database</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Tables:</span>
                    <span>{systemHealth.database.tables_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RLS Enabled:</span>
                    <span>{systemHealth.database.rls_enabled_tables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Connections:</span>
                    <span>{systemHealth.database.active_connections}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Authentication</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span>{systemHealth.authentication.total_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sessions:</span>
                    <span>{systemHealth.authentication.active_sessions}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Query Time:</span>
                    <span>{systemHealth.performance.avg_query_time}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries:</span>
                    <span>{systemHealth.performance.slow_queries_count}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Integrations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Guesty Listings:</span>
                    <span>{systemHealth.integrations.guesty_listings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guesty Bookings:</span>
                    <span>{systemHealth.integrations.guesty_bookings}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboard;