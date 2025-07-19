import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Clock, Users, Phone, Calendar } from 'lucide-react';
import { AutomatedMessaging } from './AutomatedMessaging';
import { GuestChatInterface } from './GuestChatInterface';
import { CommunicationTemplates } from './CommunicationTemplates';
import { GuestPortal } from './GuestPortal';

export const GuestCommunicationDashboard = () => {
  const [activeConversations] = useState(8);
  const [pendingMessages] = useState(3);
  const [scheduledMessages] = useState(12);

  const communicationStats = [
    {
      title: "Active Conversations",
      value: activeConversations,
      icon: MessageSquare,
      color: "text-primary"
    },
    {
      title: "Pending Messages",
      value: pendingMessages,
      icon: Mail,
      color: "text-warning"
    },
    {
      title: "Scheduled Messages",
      value: scheduledMessages,
      icon: Clock,
      color: "text-info"
    },
    {
      title: "Guests This Month",
      value: 42,
      icon: Users,
      color: "text-success"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "message",
      guest: "Sarah Johnson",
      content: "Check-in instructions sent",
      time: "2 minutes ago",
      status: "delivered"
    },
    {
      id: 2,
      type: "call",
      guest: "Mike Chen",
      content: "Urgent maintenance request",
      time: "15 minutes ago",
      status: "pending"
    },
    {
      id: 3,
      type: "automated",
      guest: "Emma Wilson",
      content: "Pre-arrival welcome message",
      time: "1 hour ago",
      status: "scheduled"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Guest Communication</h2>
          <p className="text-muted-foreground">Manage all guest interactions and automated messaging</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Line
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {communicationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Communication Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-primary" />}
                  {activity.type === 'call' && <Phone className="h-4 w-4 text-warning" />}
                  {activity.type === 'automated' && <Calendar className="h-4 w-4 text-info" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.guest}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <Badge 
                      variant={activity.status === 'delivered' ? 'default' : 
                              activity.status === 'pending' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Communication Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">Live Chat</TabsTrigger>
              <TabsTrigger value="automated">Automation</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="portal">Guest Portal</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <GuestChatInterface />
            </TabsContent>

            <TabsContent value="automated" className="space-y-4">
              <AutomatedMessaging />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <CommunicationTemplates />
            </TabsContent>

            <TabsContent value="portal" className="space-y-4">
              <GuestPortal />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};