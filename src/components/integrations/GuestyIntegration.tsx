import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/services/logger';
import { Home, RefreshCw, Settings, AlertCircle, CheckCircle, Database, Calendar } from 'lucide-react';

export const GuestyIntegration = () => {
  const [autoSync, setAutoSync] = useState(true);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  const guestyStats = [
    {
      title: "Total Bookings",
      value: "1,247",
      change: "+23 today",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Active Listings",
      value: "12",
      change: "All synced",
      icon: Home,
      color: "text-success"
    },
    {
      title: "API Calls",
      value: "8,247",
      change: "Last 24h",
      icon: Database,
      color: "text-info"
    },
    {
      title: "Rate Limit",
      value: "85%",
      change: "Used today",
      icon: AlertCircle,
      color: "text-warning"
    }
  ];

  const syncStatus = [
    {
      dataType: "Listings",
      lastSync: "2 minutes ago",
      status: "success",
      recordsCount: 12,
      nextSync: "In 5 minutes"
    },
    {
      dataType: "Bookings",
      lastSync: "2 minutes ago", 
      status: "success",
      recordsCount: 1247,
      nextSync: "In 5 minutes"
    },
    {
      dataType: "Guests",
      lastSync: "5 minutes ago",
      status: "success", 
      recordsCount: 892,
      nextSync: "In 10 minutes"
    },
    {
      dataType: "Financial Data",
      lastSync: "1 hour ago",
      status: "warning",
      recordsCount: 234,
      nextSync: "In 2 hours",
      message: "Some transactions pending"
    },
    {
      dataType: "Calendar Events",
      lastSync: "10 minutes ago",
      status: "success",
      recordsCount: 156,
      nextSync: "In 15 minutes"
    }
  ];

  const webhookEvents = [
    {
      event: "booking.created",
      description: "New booking received",
      enabled: true,
      lastTriggered: "3 minutes ago",
      count: 23
    },
    {
      event: "booking.updated", 
      description: "Booking details changed",
      enabled: true,
      lastTriggered: "8 minutes ago",
      count: 45
    },
    {
      event: "booking.cancelled",
      description: "Booking was cancelled",
      enabled: true,
      lastTriggered: "2 hours ago",
      count: 3
    },
    {
      event: "listing.updated",
      description: "Property listing changed",
      enabled: false,
      lastTriggered: "1 day ago",
      count: 8
    },
    {
      event: "guest.created",
      description: "New guest registered",
      enabled: true,
      lastTriggered: "15 minutes ago",
      count: 12
    }
  ];

  const apiEndpoints = [
    {
      endpoint: "/listings",
      method: "GET",
      calls: "2,345",
      avgResponse: "245ms",
      errorRate: "0.2%",
      status: "healthy"
    },
    {
      endpoint: "/reservations",
      method: "GET", 
      calls: "5,892",
      avgResponse: "312ms",
      errorRate: "0.1%",
      status: "healthy"
    },
    {
      endpoint: "/calendar",
      method: "GET",
      calls: "1,234",
      avgResponse: "189ms", 
      errorRate: "0.3%",
      status: "healthy"
    },
    {
      endpoint: "/webhooks",
      method: "POST",
      calls: "456",
      avgResponse: "567ms",
      errorRate: "1.2%",
      status: "warning"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const forceSyncData = (dataType: string) => {
    logger.info('GuestyIntegration', 'Force syncing', { dataType });
  };

  const testWebhook = (event: string) => {
    logger.debug('GuestyIntegration', 'Testing webhook', { event });
  };

  return (
    <div className="space-y-6">
      {/* Guesty Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {guestyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Guesty Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input id="apiKey" type="password" placeholder="Enter Guesty API key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input id="accountId" placeholder="Enter Guesty account ID" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-sm text-muted-foreground">Automatically sync data every 5 minutes</p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Webhooks</h4>
                <p className="text-sm text-muted-foreground">Real-time data updates</p>
              </div>
              <Switch checked={webhooksEnabled} onCheckedChange={setWebhooksEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Rate Limit Alerts</h4>
                <p className="text-sm text-muted-foreground">Notify when approaching limits</p>
              </div>
              <Switch checked={rateLimitWarning} onCheckedChange={setRateLimitWarning} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
            Data Synchronization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncStatus.map((sync, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(sync.status)}
                  <div>
                    <h4 className="font-medium text-foreground">{sync.dataType}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Last sync: {sync.lastSync}</span>
                      <span>Records: {sync.recordsCount.toLocaleString()}</span>
                    </div>
                    {sync.message && (
                      <p className="text-sm text-warning mt-1">{sync.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">{sync.nextSync}</div>
                    <div className="text-muted-foreground">Next sync</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => forceSyncData(sync.dataType)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhookEvents.map((webhook, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={webhook.enabled} />
                  <div>
                    <h4 className="font-medium text-sm">{webhook.event}</h4>
                    <p className="text-xs text-muted-foreground">{webhook.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Last: {webhook.lastTriggered}</span>
                      <span>Count: {webhook.count}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => testWebhook(webhook.event)}>
                  Test
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{endpoint.method}</Badge>
                    <span className="font-medium text-sm">{endpoint.endpoint}</span>
                  </div>
                  <Badge variant={endpoint.status === 'healthy' ? 'default' : 'secondary'} className="text-xs">
                    {endpoint.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-medium">{endpoint.calls}</div>
                    <div className="text-muted-foreground">Calls</div>
                  </div>
                  <div>
                    <div className="font-medium">{endpoint.avgResponse}</div>
                    <div className="text-muted-foreground">Avg Response</div>
                  </div>
                  <div>
                    <div className="font-medium">{endpoint.errorRate}</div>
                    <div className="text-muted-foreground">Error Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>API Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">1,000</div>
              <div className="text-sm text-muted-foreground">Requests/Hour Limit</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">847</div>
              <div className="text-sm text-muted-foreground">Used This Hour</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">153</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hourly Usage</span>
              <span>84.7%</span>
            </div>
            <Progress value={84.7} className="w-full" />
            <p className="text-xs text-muted-foreground">
              Rate limit resets in 23 minutes. Consider implementing request queuing if approaching limits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};