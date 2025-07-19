import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Send, Users, Calendar, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';

export const PushNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const notificationTypes = [
    {
      type: "Task Assignments",
      description: "New tasks assigned to you",
      enabled: true,
      priority: "high",
      count: 45
    },
    {
      type: "Task Reminders",
      description: "Upcoming task deadlines",
      enabled: true,
      priority: "medium",
      count: 28
    },
    {
      type: "Urgent Issues",
      description: "Emergency maintenance requests",
      enabled: true,
      priority: "critical",
      count: 3
    },
    {
      type: "Schedule Changes",
      description: "Shift and schedule updates",
      enabled: true,
      priority: "medium",
      count: 12
    },
    {
      type: "Guest Messages",
      description: "Direct guest communications",
      enabled: false,
      priority: "high",
      count: 0
    },
    {
      type: "System Updates",
      description: "App updates and announcements",
      enabled: true,
      priority: "low",
      count: 8
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: "New Task Assigned",
      message: "Standard Cleaning - Villa Aurora, Room 3",
      type: "task_assignment",
      priority: "high",
      timestamp: "2 minutes ago",
      read: false,
      recipient: "Maria Santos"
    },
    {
      id: 2,
      title: "Urgent Maintenance",
      message: "Water leak reported in Villa Serenity bathroom",
      type: "urgent_issue",
      priority: "critical",
      timestamp: "8 minutes ago",
      read: true,
      recipient: "All Maintenance Staff"
    },
    {
      id: 3,
      title: "Task Reminder",
      message: "Inventory check due in 30 minutes",
      type: "reminder",
      priority: "medium",
      timestamp: "15 minutes ago",
      read: false,
      recipient: "Elena Papadopoulos"
    },
    {
      id: 4,
      title: "Schedule Update",
      message: "Tomorrow's shift start time changed to 9:00 AM",
      type: "schedule_change",
      priority: "medium",
      timestamp: "1 hour ago",
      read: true,
      recipient: "All Staff"
    }
  ];

  const notificationTemplates = [
    {
      name: "Task Assignment",
      subject: "New task assigned: {task_title}",
      body: "You have been assigned a new task: {task_title} at {property_name}. Due: {due_time}. Priority: {priority}.",
      variables: ["task_title", "property_name", "due_time", "priority"]
    },
    {
      name: "Urgent Issue",
      subject: "🚨 Urgent: {issue_type}",
      body: "URGENT: {issue_description} at {location}. Please respond immediately. Contact: {contact_number}.",
      variables: ["issue_type", "issue_description", "location", "contact_number"]
    },
    {
      name: "Task Reminder",
      subject: "⏰ Task due soon: {task_title}",
      body: "Reminder: {task_title} is due in {time_remaining}. Location: {location}.",
      variables: ["task_title", "time_remaining", "location"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assignment': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'urgent_issue': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'reminder': return <Clock className="h-4 w-4 text-warning" />;
      case 'schedule_change': return <Calendar className="h-4 w-4 text-info" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const sendTestNotification = () => {
    console.log('Sending test notification...');
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Push Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Enable mobile notifications</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Sound Alerts</h4>
                <p className="text-sm text-muted-foreground">Play notification sounds</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Vibration</h4>
                <p className="text-sm text-muted-foreground">Vibrate on notifications</p>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={type.enabled} />
                  <div>
                    <h4 className="font-medium text-foreground">{type.type}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {type.count} sent
                  </Badge>
                  <Badge variant={getPriorityColor(type.priority) as any}>
                    {type.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className={`flex items-start gap-3 p-4 border rounded-lg ${
                !notification.read ? 'bg-primary/5 border-primary/20' : ''
              }`}>
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{notification.timestamp}</span>
                    <span>•</span>
                    <span>To: {notification.recipient}</span>
                    <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Test Notification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-muted-foreground" />
              Send Test Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testTitle">Title</Label>
              <Input id="testTitle" placeholder="Test notification title" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testMessage">Message</Label>
              <Textarea id="testMessage" placeholder="Test notification message" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={sendTestNotification} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </CardContent>
        </Card>

        {/* Notification Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Notification Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted-foreground">Sent Today</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-success">94%</div>
                <div className="text-sm text-muted-foreground">Delivery Rate</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-info">89%</div>
                <div className="text-sm text-muted-foreground">Read Rate</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-warning">2.3s</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Notification Templates</h4>
              {notificationTemplates.map((template, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">{template.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{template.subject}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.variables.map((variable, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};