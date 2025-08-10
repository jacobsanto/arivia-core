import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Plug, RefreshCw, CheckCircle, AlertTriangle, Settings, Globe } from 'lucide-react';
import { GuestyIntegration } from './GuestyIntegration';
import { PaymentIntegrations } from './PaymentIntegrations';
import { CommunicationIntegrations } from './CommunicationIntegrations';
import { MarketplaceIntegrations } from './MarketplaceIntegrations';

export const ThirdPartyIntegrationsDashboard = () => {
  const [syncInProgress, setSyncInProgress] = useState(false);

  const integrationStats = [
    {
      title: "Active Integrations",
      value: 8,
      icon: Plug,
      color: "text-primary",
      description: "Connected services"
    },
    {
      title: "API Calls Today",
      value: "12.4K",
      icon: Globe,
      color: "text-info",
      description: "Total requests"
    },
    {
      title: "Sync Status",
      value: "98.5%",
      icon: RefreshCw,
      color: "text-success",
      description: "Success rate"
    },
    {
      title: "Data Synced",
      value: "2.1GB",
      icon: CheckCircle,
      color: "text-warning",
      description: "Last 24 hours"
    }
  ];

  const connectedIntegrations = [
    {
      name: "Guesty",
      category: "Property Management",
      status: "connected",
      lastSync: "2 minutes ago",
      health: 98,
      dataTypes: ["Bookings", "Listings", "Guests"],
      apiCalls: "8.2K",
      description: "Primary property management system"
    },
    {
      name: "Stripe",
      category: "Payments",
      status: "connected",
      lastSync: "5 minutes ago",
      health: 100,
      dataTypes: ["Payments", "Refunds", "Fees"],
      apiCalls: "1.8K",
      description: "Payment processing platform"
    },
    {
      name: "WhatsApp Business",
      category: "Communication",
      status: "connected",
      lastSync: "1 minute ago",
      health: 95,
      dataTypes: ["Messages", "Media", "Status"],
      apiCalls: "2.1K",
      description: "Guest communication channel"
    },
    {
      name: "Google Calendar",
      category: "Calendar",
      status: "connected",
      lastSync: "10 minutes ago",
      health: 92,
      dataTypes: ["Events", "Availability"],
      apiCalls: "340",
      description: "Calendar synchronization"
    },
    {
      name: "QuickBooks",
      category: "Accounting",
      status: "error",
      lastSync: "2 hours ago",
      health: 45,
      dataTypes: ["Invoices", "Expenses"],
      apiCalls: "120",
      description: "Financial data management",
      error: "API key expired"
    },
    {
      name: "Mailchimp",
      category: "Marketing",
      status: "disconnected",
      lastSync: "Never",
      health: 0,
      dataTypes: ["Campaigns", "Contacts"],
      apiCalls: "0",
      description: "Email marketing automation"
    }
  ];

  const availableIntegrations = [
    {
      name: "Airbnb",
      category: "Marketplace",
      description: "Connect with Airbnb platform",
      difficulty: "medium",
      estimatedTime: "30 minutes"
    },
    {
      name: "Booking.com",
      category: "Marketplace", 
      description: "Sync with Booking.com reservations",
      difficulty: "medium",
      estimatedTime: "45 minutes"
    },
    {
      name: "Slack",
      category: "Communication",
      description: "Team communication integration",
      difficulty: "easy",
      estimatedTime: "15 minutes"
    },
    {
      name: "Zapier",
      category: "Automation",
      description: "Connect with 5000+ apps",
      difficulty: "easy",
      estimatedTime: "20 minutes"
    },
    {
      name: "Xero",
      category: "Accounting",
      description: "Advanced accounting integration",
      difficulty: "hard",
      estimatedTime: "2 hours"
    },
    {
      name: "TrustYou",
      category: "Analytics",
      description: "Guest review analytics",
      difficulty: "medium",
      estimatedTime: "1 hour"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-destructive';
      case 'disconnected': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'disconnected': return 'secondary';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const forceSyncAll = () => {
    setSyncInProgress(true);
    setTimeout(() => setSyncInProgress(false), 4000);
  };

  const toggleIntegration = (integrationName: string) => {
    console.log('Toggling integration:', integrationName);
  };

  const setupIntegration = (integrationName: string) => {
    console.log('Setting up integration:', integrationName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Third-Party Integrations</h2>
          <p className="text-muted-foreground">Manage all external service connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={forceSyncAll} disabled={syncInProgress}>
            {syncInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All
              </>
            )}
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Integration Settings
          </Button>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Sync Progress */}
      {syncInProgress && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Synchronizing all integrations...</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="w-full" />
              <p className="text-xs text-muted-foreground">Currently syncing: Guesty bookings data</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Integration Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Integrations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              Connected Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedIntegrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${getStatusColor(integration.status)}`}>
                    <Plug className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{integration.name}</h4>
                      <Badge variant={getStatusBadge(integration.status) as any}>
                        {integration.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Last sync: {integration.lastSync}</span>
                      <span>API calls: {integration.apiCalls}</span>
                      {integration.error && (
                        <span className="text-destructive">Error: {integration.error}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {integration.dataTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{integration.health}%</div>
                    <div className="text-xs text-muted-foreground">Health</div>
                  </div>
                  <div className="w-16">
                    <Progress value={integration.health} className="h-2" />
                  </div>
                  <Switch 
                    checked={integration.status === 'connected'} 
                    onCheckedChange={() => toggleIntegration(integration.name)}
                    disabled={integration.status === 'error'}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              Available Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableIntegrations.map((integration, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{integration.name}</h4>
                  <Badge variant={getDifficultyColor(integration.difficulty) as any} className="text-xs">
                    {integration.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{integration.category}</span>
                  <span>Setup: {integration.estimatedTime}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setupIntegration(integration.name)}
                >
                  Setup Integration
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration Details Tabs */}
      <Tabs defaultValue="guesty" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guesty">Guesty</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="guesty" className="space-y-4">
          <GuestyIntegration />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentIntegrations />
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <CommunicationIntegrations />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <MarketplaceIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};