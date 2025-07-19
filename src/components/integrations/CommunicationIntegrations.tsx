import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Mail, Phone, Send, Users, Bot, Bell } from 'lucide-react';

export const CommunicationIntegrations = () => {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoResponses, setAutoResponses] = useState(true);

  const communicationChannels = [
    {
      name: "WhatsApp Business",
      status: "connected",
      type: "Messaging",
      messages: "2,847",
      responses: "98.5%",
      avgResponse: "3.2 min",
      health: 96,
      lastMessage: "5 minutes ago"
    },
    {
      name: "Gmail/Outlook",
      status: "connected",
      type: "Email",
      messages: "1,234",
      responses: "95.2%", 
      avgResponse: "1.8 hours",
      health: 94,
      lastMessage: "12 minutes ago"
    },
    {
      name: "Twilio SMS",
      status: "disconnected",
      type: "SMS",
      messages: "0",
      responses: "0%",
      avgResponse: "N/A",
      health: 0,
      lastMessage: "Never"
    },
    {
      name: "Slack",
      status: "available",
      type: "Team Chat",
      messages: "N/A",
      responses: "N/A",
      avgResponse: "N/A",
      health: 0,
      lastMessage: "N/A"
    }
  ];

  const messageTemplates = [
    {
      name: "Check-in Reminder",
      channel: "WhatsApp",
      type: "automated",
      usage: 89,
      lastUsed: "2 hours ago",
      content: "Hi {guest_name}! Your check-in at {property_name} is tomorrow at {check_in_time}. Looking forward to welcoming you!"
    },
    {
      name: "Welcome Message",
      channel: "WhatsApp", 
      type: "automated",
      usage: 95,
      lastUsed: "15 minutes ago",
      content: "Welcome to {property_name}! Your host is {host_name}. WiFi: {wifi_password}. Need anything? Just reply to this message!"
    },
    {
      name: "Checkout Instructions",
      channel: "Email",
      type: "automated", 
      usage: 78,
      lastUsed: "1 hour ago",
      content: "Thank you for staying with us! Checkout is at 11 AM. Please leave keys in the lockbox. We'd love your feedback!"
    },
    {
      name: "Maintenance Update",
      channel: "WhatsApp",
      type: "manual",
      usage: 23,
      lastUsed: "3 days ago",
      content: "Hi {guest_name}, we've resolved the {issue_type} in your unit. Everything should be working perfectly now. Sorry for any inconvenience!"
    }
  ];

  const recentMessages = [
    {
      id: 1,
      channel: "WhatsApp",
      guest: "Sarah Johnson",
      property: "Villa Aurora",
      message: "Thank you for the quick response about the WiFi!",
      type: "received",
      timestamp: "5 minutes ago",
      status: "read"
    },
    {
      id: 2,
      channel: "WhatsApp", 
      guest: "Mike Chen",
      property: "Villa Serenity",
      message: "Check-in reminder: Tomorrow at 3:00 PM",
      type: "sent",
      timestamp: "12 minutes ago",
      status: "delivered"
    },
    {
      id: 3,
      channel: "Email",
      guest: "Emma Wilson", 
      property: "Villa Paradise",
      message: "Checkout instructions and feedback request",
      type: "sent",
      timestamp: "1 hour ago",
      status: "opened"
    },
    {
      id: 4,
      channel: "WhatsApp",
      guest: "David Brown",
      property: "Villa Sunset",
      message: "Is there a coffee machine in the kitchen?",
      type: "received", 
      timestamp: "2 hours ago",
      status: "unread"
    }
  ];

  const autoResponseRules = [
    {
      trigger: "wifi",
      response: "WiFi Network: {property_wifi}, Password: {wifi_password}",
      enabled: true,
      channels: ["WhatsApp", "SMS"]
    },
    {
      trigger: "checkout",
      response: "Checkout is at 11:00 AM. Please leave keys in the lockbox and ensure all windows/doors are locked.",
      enabled: true,
      channels: ["WhatsApp", "Email"]
    },
    {
      trigger: "emergency", 
      response: "For emergencies, please call +30 123 456 7890 immediately. For non-urgent issues, I'll respond shortly.",
      enabled: true,
      channels: ["WhatsApp", "SMS"]
    },
    {
      trigger: "amenities",
      response: "Your property includes: {amenities_list}. Check the welcome guide for detailed instructions!",
      enabled: false,
      channels: ["WhatsApp"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-muted-foreground';
      case 'available': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'secondary';
      case 'available': return 'outline';
      default: return 'outline';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'Email': case 'Gmail/Outlook': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'SMS': case 'Twilio SMS': return <Phone className="h-4 w-4 text-orange-500" />;
      case 'Slack': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const connectChannel = (channel: string) => {
    console.log('Connecting communication channel:', channel);
  };

  const editTemplate = (template: string) => {
    console.log('Editing template:', template);
  };

  const sendTestMessage = () => {
    console.log('Sending test message...');
  };

  return (
    <div className="space-y-6">
      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Communication Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communicationChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${getStatusColor(channel.status)}`}>
                    {getChannelIcon(channel.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{channel.name}</h4>
                      <Badge variant={getStatusBadge(channel.status) as any}>
                        {channel.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{channel.type}</p>
                    {channel.status === 'connected' && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Messages: {channel.messages}</span>
                        <span>Response Rate: {channel.responses}</span>
                        <span>Avg Response: {channel.avgResponse}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {channel.status === 'connected' && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{channel.health}%</div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                  )}
                  {channel.status === 'available' || channel.status === 'disconnected' ? (
                    <Button size="sm" variant="outline" onClick={() => connectChannel(channel.name)}>
                      Connect
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">WhatsApp</h4>
                <p className="text-sm text-muted-foreground">Primary messaging</p>
              </div>
              <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">Formal communications</p>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">SMS</h4>
                <p className="text-sm text-muted-foreground">Backup messaging</p>
              </div>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto Responses</h4>
                <p className="text-sm text-muted-foreground">Automated replies</p>
              </div>
              <Switch checked={autoResponses} onCheckedChange={setAutoResponses} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultSender">Default Sender Name</Label>
              <Input id="defaultSender" placeholder="Arivia Villas Team" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTime">Target Response Time</Label>
              <Input id="responseTime" placeholder="15 minutes" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-muted-foreground" />
              Message Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messageTemplates.map((template, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(template.channel)}
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{template.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{template.usage}% usage</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Last used: {template.lastUsed}</span>
                    <Button size="sm" variant="outline" onClick={() => editTemplate(template.name)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-muted-foreground" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getChannelIcon(message.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{message.guest}</span>
                      <Badge variant="outline" className="text-xs">{message.property}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{message.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{message.timestamp}</span>
                      <Badge 
                        variant={message.type === 'received' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {message.type}
                      </Badge>
                      <Badge 
                        variant={message.status === 'unread' ? 'destructive' : 'outline'} 
                        className="text-xs"
                      >
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Response Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Auto Response Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {autoResponseRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={rule.enabled} />
                  <div>
                    <h4 className="font-medium text-sm">Trigger: "{rule.trigger}"</h4>
                    <p className="text-xs text-muted-foreground">{rule.response}</p>
                    <div className="flex gap-1 mt-2">
                      {rule.channels.map((channel, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Edit Rule
                </Button>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Test Communication</h4>
              <p className="text-sm text-muted-foreground">Send a test message to verify integrations</p>
            </div>
            <Button onClick={sendTestMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};