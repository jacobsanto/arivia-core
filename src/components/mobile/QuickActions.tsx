import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, CheckCircle, Camera, MapPin, Phone, MessageSquare, Clock, Star, BarChart } from 'lucide-react';

export const QuickActions = () => {
  const [recentActions, setRecentActions] = useState([
    { id: 1, action: 'Mark Task Complete', count: 23, lastUsed: '2 min ago' },
    { id: 2, action: 'Take Photo', count: 18, lastUsed: '5 min ago' },
    { id: 3, action: 'Report Issue', count: 7, lastUsed: '15 min ago' },
    { id: 4, action: 'Check Location', count: 12, lastUsed: '8 min ago' }
  ]);

  const quickActionButtons = [
    {
      id: 'complete_task',
      label: 'Complete Task',
      icon: CheckCircle,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Mark current task as completed',
      shortcut: 'Swipe right',
      usage: 89
    },
    {
      id: 'take_photo',
      label: 'Take Photo',
      icon: Camera,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Capture photo for documentation',
      shortcut: 'Long press camera',
      usage: 76
    },
    {
      id: 'report_issue',
      label: 'Report Issue',
      icon: MessageSquare,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Report maintenance or damage',
      shortcut: 'Shake phone',
      usage: 34
    },
    {
      id: 'check_location',
      label: 'Check Location',
      icon: MapPin,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Verify current property location',
      shortcut: 'Double tap GPS',
      usage: 67
    },
    {
      id: 'emergency_contact',
      label: 'Emergency Contact',
      icon: Phone,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Quick call to emergency line',
      shortcut: 'Triple tap',
      usage: 5
    },
    {
      id: 'quick_note',
      label: 'Quick Note',
      icon: MessageSquare,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Add voice or text note',
      shortcut: 'Hold mic button',
      usage: 45
    }
  ];

  const gestureControls = [
    {
      gesture: 'Swipe Right',
      action: 'Complete Task',
      description: 'Mark current task as completed',
      enabled: true
    },
    {
      gesture: 'Swipe Left',
      action: 'Skip Task',
      description: 'Move to next task in queue',
      enabled: true
    },
    {
      gesture: 'Double Tap',
      action: 'Take Photo',
      description: 'Quick camera access',
      enabled: true
    },
    {
      gesture: 'Long Press',
      action: 'Voice Note',
      description: 'Start voice recording',
      enabled: true
    },
    {
      gesture: 'Shake Device',
      action: 'Emergency Report',
      description: 'Report urgent issue',
      enabled: false
    },
    {
      gesture: 'Triple Tap',
      action: 'Emergency Call',
      description: 'Call emergency contact',
      enabled: true
    }
  ];

  const widgetConfigs = [
    {
      name: 'Today\'s Tasks',
      type: 'task_summary',
      size: 'medium',
      enabled: true,
      position: 1
    },
    {
      name: 'Quick Complete',
      type: 'action_button',
      size: 'small',
      enabled: true,
      position: 2
    },
    {
      name: 'Photo Camera',
      type: 'camera_shortcut',
      size: 'small',
      enabled: true,
      position: 3
    },
    {
      name: 'Current Location',
      type: 'location_display',
      size: 'medium',
      enabled: false,
      position: 4
    },
    {
      name: 'Recent Messages',
      type: 'message_feed',
      size: 'large',
      enabled: true,
      position: 5
    }
  ];

  const executeQuickAction = (actionId: string) => {
    console.log('Executing quick action:', actionId);
    // Simulate action execution
    setRecentActions(prev => 
      prev.map(action => 
        action.action.toLowerCase().includes(actionId.split('_')[0]) 
          ? { ...action, count: action.count + 1, lastUsed: 'Just now' }
          : action
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            Quick Action Buttons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActionButtons.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => executeQuickAction(action.id)}
                        className={`p-2 rounded-lg text-white transition-colors ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                      <div>
                        <h4 className="font-medium">{action.label}</h4>
                        <p className="text-xs text-muted-foreground">{action.shortcut}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.usage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${action.usage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gesture Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-muted-foreground" />
            Gesture Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gestureControls.map((gesture, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${gesture.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    <span className="text-sm font-medium">{gesture.gesture}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{gesture.action}</h4>
                    <p className="text-sm text-muted-foreground">{gesture.description}</p>
                  </div>
                </div>
                <Badge variant={gesture.enabled ? 'default' : 'secondary'}>
                  {gesture.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics & Widget Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-muted-foreground" />
              Recent Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{action.action}</h4>
                    <p className="text-xs text-muted-foreground">Used {action.count} times</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{action.lastUsed}</div>
                    <Badge variant="outline" className="text-xs">
                      {action.count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold text-primary">127</div>
                <div className="text-sm text-muted-foreground">Today's Actions</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold text-success">2.3s</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Home Screen Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {widgetConfigs.map((widget, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{widget.position}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground">{widget.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {widget.size}
                    </Badge>
                    <Badge variant={widget.enabled ? 'default' : 'secondary'} className="text-xs">
                      {widget.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Configure Layout
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Add Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Action Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">0.8s</div>
              <div className="text-sm text-muted-foreground">Avg Action Time</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">94%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-info">156</div>
              <div className="text-sm text-muted-foreground">Daily Usage</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">4.8/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};