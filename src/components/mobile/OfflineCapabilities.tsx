import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { WifiOff, Download, Upload, Database, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const OfflineCapabilities = () => {
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const offlineStats = [
    {
      title: "Offline Tasks",
      value: 12,
      description: "Pending sync",
      icon: WifiOff,
      color: "text-warning"
    },
    {
      title: "Storage Used",
      value: "2.4 MB",
      description: "Local cache size",
      icon: Database,
      color: "text-info"
    },
    {
      title: "Sync Success",
      value: "98%",
      description: "Upload success rate",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Last Sync",
      value: "5 min ago",
      description: "Most recent sync",
      icon: RefreshCw,
      color: "text-primary"
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      title: "Standard Cleaning - Villa Aurora",
      type: "task_completion",
      timestamp: "14:25",
      status: "completed_offline",
      syncPriority: "high",
      dataSize: "156 KB"
    },
    {
      id: 2,
      title: "Maintenance Report - Villa Serenity",
      type: "damage_report",
      timestamp: "13:45",
      status: "pending_sync",
      syncPriority: "high",
      dataSize: "2.1 MB"
    },
    {
      id: 3,
      title: "Inventory Update - Central Storage",
      type: "inventory_count",
      timestamp: "12:30",
      status: "sync_failed",
      syncPriority: "medium",
      dataSize: "45 KB"
    },
    {
      id: 4,
      title: "Photo Upload - Villa Paradise",
      type: "photo_upload",
      timestamp: "11:15",
      status: "queued",
      syncPriority: "low",
      dataSize: "3.2 MB"
    }
  ];

  const offlineFeatures = [
    {
      feature: "Task Completion",
      enabled: true,
      description: "Complete tasks without internet connection",
      storageUsed: "245 KB"
    },
    {
      feature: "Photo Capture",
      enabled: true,
      description: "Take and store photos locally",
      storageUsed: "5.2 MB"
    },
    {
      feature: "Voice Notes",
      enabled: true,
      description: "Record voice memos offline",
      storageUsed: "1.8 MB"
    },
    {
      feature: "Inventory Updates",
      enabled: true,
      description: "Update inventory counts offline",
      storageUsed: "89 KB"
    },
    {
      feature: "GPS Tracking",
      enabled: false,
      description: "Location tracking without data connection",
      storageUsed: "0 KB"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed_offline': return 'text-success';
      case 'pending_sync': return 'text-warning';
      case 'sync_failed': return 'text-destructive';
      case 'queued': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed_offline': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending_sync': return <Upload className="h-4 w-4 text-warning" />;
      case 'sync_failed': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'queued': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const forceSyncAll = () => {
    setSyncInProgress(true);
    setTimeout(() => setSyncInProgress(false), 3000);
  };

  const retrySyncItem = (taskId: number) => {
    console.log('Retrying sync for task:', taskId);
  };

  return (
    <div className="space-y-6">
      {/* Offline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offlineStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Offline Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-muted-foreground" />
            Offline Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Enable Offline Mode</h4>
                <p className="text-sm text-muted-foreground">Allow app to work without internet</p>
              </div>
              <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-sm text-muted-foreground">Automatically sync when online</p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sync Controls</h4>
              <Button onClick={forceSyncAll} disabled={syncInProgress}>
                {syncInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Sync All
                  </>
                )}
              </Button>
            </div>
            
            {syncInProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing offline data...</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Sync Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            Pending Sync Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{task.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{task.timestamp}</span>
                      <span>•</span>
                      <span>{task.dataSize}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(task.syncPriority) as any}>
                    {task.syncPriority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {task.status === 'sync_failed' && (
                    <Button size="sm" variant="outline" onClick={() => retrySyncItem(task.id)}>
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Feature Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offlineFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={feature.enabled} />
                  <div>
                    <h4 className="font-medium text-foreground">{feature.feature}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{feature.storageUsed}</div>
                  <div className="text-xs text-muted-foreground">Storage</div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Total Offline Storage</h4>
              <p className="text-sm text-muted-foreground">Used space for offline data</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">7.4 MB</div>
              <div className="text-sm text-muted-foreground">of 50 MB limit</div>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-sm">
              <span>Storage Usage</span>
              <span>14.8%</span>
            </div>
            <Progress value={14.8} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};