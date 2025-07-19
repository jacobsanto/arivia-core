import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, MessageSquare, Edit, Trash2, Play } from 'lucide-react';

export const AutomatedMessaging = () => {
  const [automationRules] = useState([
    {
      id: 1,
      name: "Pre-arrival Welcome",
      trigger: "48 hours before check-in",
      message: "Welcome to Arivia Villas! We're excited to host you...",
      active: true,
      sent: 24,
      channel: "SMS + Email"
    },
    {
      id: 2,
      name: "Check-in Instructions",
      trigger: "4 hours before check-in",
      message: "Your villa is ready! Here are your check-in details...",
      active: true,
      sent: 18,
      channel: "SMS"
    },
    {
      id: 3,
      name: "Mid-stay Check-in",
      trigger: "Day 3 of stay",
      message: "How is your stay going? Is there anything we can help with?",
      active: false,
      sent: 12,
      channel: "WhatsApp"
    },
    {
      id: 4,
      name: "Check-out Reminder",
      trigger: "1 hour before check-out",
      message: "Thank you for staying with us! Check-out is at 11 AM...",
      active: true,
      sent: 22,
      channel: "Email"
    }
  ]);

  const [showCreateRule, setShowCreateRule] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Automated Messaging</h3>
          <p className="text-sm text-muted-foreground">Set up automatic messages based on booking events</p>
        </div>
        <Button onClick={() => setShowCreateRule(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Create New Rule Form */}
      {showCreateRule && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Create Automation Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input id="ruleName" placeholder="e.g., Pre-arrival Welcome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Event</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking-confirmed">Booking Confirmed</SelectItem>
                    <SelectItem value="48h-before">48 hours before check-in</SelectItem>
                    <SelectItem value="24h-before">24 hours before check-in</SelectItem>
                    <SelectItem value="4h-before">4 hours before check-in</SelectItem>
                    <SelectItem value="checkin">At check-in time</SelectItem>
                    <SelectItem value="midstay">Mid-stay (Day 3)</SelectItem>
                    <SelectItem value="1h-checkout">1 hour before check-out</SelectItem>
                    <SelectItem value="checkout">At check-out</SelectItem>
                    <SelectItem value="post-stay">24 hours after check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageContent">Message Content</Label>
              <Textarea 
                id="messageContent"
                placeholder="Your automated message content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Communication Channel</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms-email">SMS + Email</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="active" />
                <Label htmlFor="active">Activate immediately</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button>Create Rule</Button>
              <Button variant="outline" onClick={() => setShowCreateRule(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Automation Rules */}
      <div className="grid gap-4">
        {automationRules.map((rule) => (
          <Card key={rule.id} className={`hover:shadow-md transition-shadow ${!rule.active ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{rule.name}</h4>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{rule.channel}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>Triggers: {rule.trigger}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {rule.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      {rule.sent} messages sent
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">76</div>
            <div className="text-sm text-muted-foreground">Messages sent today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">94%</div>
            <div className="text-sm text-muted-foreground">Delivery rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">4.8</div>
            <div className="text-sm text-muted-foreground">Guest satisfaction</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
