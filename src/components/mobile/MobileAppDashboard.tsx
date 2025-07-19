import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Wifi, Bell, MapPin, Camera, Clock, CheckCircle } from 'lucide-react';
import { MobileTaskInterface } from './MobileTaskInterface';
import { OfflineCapabilities } from './OfflineCapabilities';
import { PushNotifications } from './PushNotifications';
import { QuickActions } from './QuickActions';

export const MobileAppDashboard = () => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const mobileStats = [
    {
      title: "Active Users",
      value: 28,
      icon: Smartphone,
      color: "text-primary",
      description: "Staff using mobile app"
    },
    {
      title: "Offline Tasks",
      value: 12,
      icon: Wifi,
      color: "text-warning",
      description: "Pending sync"
    },
    {
      title: "Push Notifications",
      value: 156,
      icon: Bell,
      color: "text-info",
      description: "Sent today"
    },
    {
      title: "Location Updates",
      value: 89,
      icon: MapPin,
      color: "text-success",
      description: "GPS check-ins"
    }
  ];

  const mobileFeatures = [
    {
      title: "Offline Task Management",
      description: "Complete tasks without internet connection",
      status: "active",
      usage: 85
    },
    {
      title: "Photo Capture & Upload",
      description: "Take photos for damage reports and task completion",
      status: "active",
      usage: 92
    },
    {
      title: "GPS Location Tracking",
      description: "Automatic location detection for task assignments",
      status: "active",
      usage: 78
    },
    {
      title: "Push Notifications",
      description: "Real-time alerts for urgent tasks and updates",
      status: "active",
      usage: 96
    },
    {
      title: "Voice-to-Text Notes",
      description: "Quick voice memos for task details",
      status: "beta",
      usage: 34
    },
    {
      title: "Barcode Scanning",
      description: "Inventory management with barcode scanning",
      status: "development",
      usage: 0
    }
  ];

  const recentMobileActivity = [
    {
      id: 1,
      user: "Maria Santos",
      action: "Completed cleaning task",
      location: "Villa Aurora - Room 3",
      time: "5 minutes ago",
      device: "iOS",
      offline: false
    },
    {
      id: 2,
      user: "Dimitris Kostas",
      action: "Reported maintenance issue",
      location: "Villa Serenity - Kitchen",
      time: "12 minutes ago",
      device: "Android",
      offline: true
    },
    {
      id: 3,
      user: "Elena Papadopoulos",
      action: "Updated inventory count",
      location: "Central Storage",
      time: "18 minutes ago",
      device: "iOS",
      offline: false
    },
    {
      id: 4,
      user: "Kostas Nikolaou",
      action: "Uploaded damage photos",
      location: "Villa Paradise - Bathroom",
      time: "25 minutes ago",
      device: "Android",
      offline: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mobile App Management</h2>
          <p className="text-muted-foreground">Optimize mobile experience for field operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            Test Features
          </Button>
          <Button>
            <Smartphone className="h-4 w-4 mr-2" />
            App Settings
          </Button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mobileStats.map((stat, index) => {
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

      {/* Mobile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            Mobile App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Offline Mode</h4>
                <p className="text-sm text-muted-foreground">Allow offline task completion</p>
              </div>
              <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Real-time alerts and updates</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Location Services</h4>
                <p className="text-sm text-muted-foreground">GPS tracking for tasks</p>
              </div>
              <Switch checked={locationServices} onCheckedChange={setLocationServices} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Mobile Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mobile Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Mobile Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMobileActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 mt-1">
                  {activity.offline ? 
                    <Wifi className="h-4 w-4 text-warning" /> : 
                    <CheckCircle className="h-4 w-4 text-success" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.device}
                    </Badge>
                    {activity.offline && (
                      <Badge variant="secondary" className="text-xs">
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mobile Features Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">Mobile Tasks</TabsTrigger>
              <TabsTrigger value="offline">Offline Mode</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              <MobileTaskInterface />
            </TabsContent>

            <TabsContent value="offline" className="space-y-4">
              <OfflineCapabilities />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <PushNotifications />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <QuickActions />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Feature Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mobileFeatures.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{feature.title}</h4>
                  <Badge 
                    variant={
                      feature.status === 'active' ? 'default' :
                      feature.status === 'beta' ? 'secondary' : 'outline'
                    }
                  >
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                {feature.status === 'active' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Usage</span>
                      <span>{feature.usage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${feature.usage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};