import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Smartphone, 
  QrCode, 
  Settings, 
  Users, 
  MapPin, 
  Wifi, 
  Car,
  Coffee,
  UtensilsCrossed,
  Phone,
  AlertTriangle
} from 'lucide-react';

export const GuestPortal = () => {
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);

  const portalFeatures = [
    {
      id: 'wifi',
      name: 'WiFi Information',
      icon: Wifi,
      description: 'Network name and password',
      enabled: true
    },
    {
      id: 'local-guide',
      name: 'Local Area Guide',
      icon: MapPin,
      description: 'Restaurants, attractions, and activities',
      enabled: true
    },
    {
      id: 'contact',
      name: 'Emergency Contacts',
      icon: Phone,
      description: 'Property manager and emergency numbers',
      enabled: true
    },
    {
      id: 'amenities',
      name: 'Villa Amenities',
      icon: Coffee,
      description: 'Pool, gym, parking, and other facilities',
      enabled: true
    },
    {
      id: 'dining',
      name: 'Dining Recommendations',
      icon: UtensilsCrossed,
      description: 'Local restaurants and delivery options',
      enabled: false
    },
    {
      id: 'transportation',
      name: 'Transportation Info',
      icon: Car,
      description: 'Taxi contacts, car rental, and public transport',
      enabled: true
    }
  ];

  const recentAccess = [
    {
      guest: "Sarah Johnson",
      property: "Villa Sunset",
      lastAccess: "2 hours ago",
      features: ["WiFi", "Local Guide", "Emergency Contacts"]
    },
    {
      guest: "Mike Chen",
      property: "Villa Azure",
      lastAccess: "5 hours ago",
      features: ["Amenities", "Transportation"]
    },
    {
      guest: "Emma Wilson",
      property: "Villa Marina",
      lastAccess: "1 day ago",
      features: ["Dining", "WiFi", "Local Guide"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Guest Portal</h3>
          <p className="text-sm text-muted-foreground">Digital concierge accessible via QR code or web link</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="portal-enabled"
              checked={portalEnabled}
              onCheckedChange={setPortalEnabled}
            />
            <Label htmlFor="portal-enabled">Portal Active</Label>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Portal Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">24</div>
            <div className="text-sm text-muted-foreground">Active portals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Smartphone className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">156</div>
            <div className="text-sm text-muted-foreground">Total accesses today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <QrCode className="h-8 w-8 text-info mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">89%</div>
            <div className="text-sm text-muted-foreground">QR code usage</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Portal Features</TabsTrigger>
          <TabsTrigger value="access">Recent Access</TabsTrigger>
          <TabsTrigger value="preview">Portal Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {portalFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={feature.enabled ? "default" : "secondary"}>
                        {feature.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Portal Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAccess.map((access, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-foreground">{access.guest}</h4>
                    <p className="text-sm text-muted-foreground">{access.property}</p>
                    <p className="text-xs text-muted-foreground">Last access: {access.lastAccess}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {access.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest Portal Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                {/* Mock mobile interface */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground">Welcome to Villa Sunset</h3>
                  <p className="text-sm text-muted-foreground">Your digital concierge</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Wifi className="h-6 w-6 mb-2" />
                    <span className="text-xs">WiFi Info</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span className="text-xs">Local Guide</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Phone className="h-6 w-6 mb-2" />
                    <span className="text-xs">Contact Us</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Coffee className="h-6 w-6 mb-2" />
                    <span className="text-xs">Amenities</span>
                  </Button>
                </div>

                <div className="bg-background rounded p-3">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Important</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For emergencies, call +30 123 456 789. Pool hours: 6AM - 10PM.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button className="flex-1">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button variant="outline" className="flex-1">
                  <Globe className="h-4 w-4 mr-2" />
                  View Live Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};