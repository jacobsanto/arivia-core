import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  HardDrive,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupRecord {
  id: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  size: string;
  duration: string;
  createdAt: Date;
  location: 'local' | 'cloud';
}

interface RestorePoint {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  size: string;
  tables: string[];
  isVerified: boolean;
}

const BackupRestore = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const [backups] = useState<BackupRecord[]>([
    {
      id: '1',
      type: 'automatic',
      status: 'completed',
      size: '245 MB',
      duration: '2m 34s',
      createdAt: new Date('2024-12-15T02:00:00'),
      location: 'cloud'
    },
    {
      id: '2',
      type: 'manual',
      status: 'completed',
      size: '238 MB',
      duration: '2m 18s',
      createdAt: new Date('2024-12-14T14:30:00'),
      location: 'local'
    },
    {
      id: '3',
      type: 'automatic',
      status: 'completed',
      size: '242 MB',
      duration: '2m 42s',
      createdAt: new Date('2024-12-14T02:00:00'),
      location: 'cloud'
    },
    {
      id: '4',
      type: 'automatic',
      status: 'failed',
      size: '0 MB',
      duration: '0s',
      createdAt: new Date('2024-12-13T02:00:00'),
      location: 'cloud'
    }
  ]);

  const [restorePoints] = useState<RestorePoint[]>([
    {
      id: '1',
      name: 'Pre-Migration Backup',
      description: 'Backup before database schema migration',
      createdAt: new Date('2024-12-10T10:00:00'),
      size: '220 MB',
      tables: ['properties', 'bookings', 'users', 'tasks'],
      isVerified: true
    },
    {
      id: '2',
      name: 'Weekly Backup',
      description: 'Scheduled weekly backup point',
      createdAt: new Date('2024-12-08T00:00:00'),
      size: '215 MB',
      tables: ['properties', 'bookings', 'users', 'tasks', 'inventory'],
      isVerified: true
    }
  ]);

  const startManualBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          toast({
            title: "Backup completed",
            description: "Manual backup has been created successfully."
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadBackup = (backupId: string) => {
    toast({
      title: "Download started",
      description: "Backup file download has been initiated."
    });
  };

  const restoreFromBackup = async (backupId: string) => {
    setIsRestoring(true);
    
    // Simulate restore process
    setTimeout(() => {
      setIsRestoring(false);
      toast({
        title: "Restore completed",
        description: "Database has been restored successfully.",
        variant: "default"
      });
    }, 3000);
  };

  const getStatusColor = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Restore Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="backups">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="backups">Backup History</TabsTrigger>
              <TabsTrigger value="restore">Restore Points</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="backups" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Recent Backups</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic backups run daily at 2:00 AM
                  </p>
                </div>
                <Button 
                  onClick={startManualBackup} 
                  disabled={isBackingUp}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isBackingUp ? 'Creating Backup...' : 'Manual Backup'}
                </Button>
              </div>

              {isBackingUp && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Backup in Progress</span>
                    </div>
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {backupProgress}% complete
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {backups.map(backup => (
                  <Card key={backup.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(backup.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {backup.type === 'automatic' ? 'Automatic Backup' : 'Manual Backup'}
                              </span>
                              <Badge variant="outline">
                                {backup.location === 'cloud' ? (
                                  <><Cloud className="h-3 w-3 mr-1" />Cloud</>
                                ) : (
                                  <><HardDrive className="h-3 w-3 mr-1" />Local</>
                                )}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {backup.createdAt.toLocaleString()} • {backup.size} • {backup.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={backup.status === 'completed' ? 'default' : 
                                   backup.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {backup.status}
                          </Badge>
                          {backup.status === 'completed' && (
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadBackup(backup.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => restoreFromBackup(backup.id)}
                                disabled={isRestoring}
                              >
                                Restore
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="restore" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Restore Points</h3>
                <p className="text-sm text-muted-foreground">
                  Verified restore points for system recovery
                </p>
              </div>

              {isRestoring && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="font-medium">Restore in Progress</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please wait while the database is being restored...
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {restorePoints.map(point => (
                  <Card key={point.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">{point.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {point.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {point.isVerified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => restoreFromBackup(point.id)}
                            disabled={isRestoring}
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>Created: {point.createdAt.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Size: {point.size}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {point.tables.map(table => (
                          <Badge key={table} variant="outline" className="text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Backup Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure backup schedule and retention policies
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Automatic Backups</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Schedule</span>
                      <Badge>Daily at 2:00 AM</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retention</span>
                      <Badge>30 days</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compression</span>
                      <Badge>Enabled</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Schedule
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Storage Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary Location</span>
                      <Badge>Cloud Storage</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup Location</span>
                      <Badge>Local Storage</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Encryption</span>
                      <Badge>AES-256</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Storage Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recovery Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Point-in-time</div>
                      <div className="text-sm text-muted-foreground">
                        Restore to any point within 7 days
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Full Restore</div>
                      <div className="text-sm text-muted-foreground">
                        Complete database restoration
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Selective</div>
                      <div className="text-sm text-muted-foreground">
                        Restore specific tables only
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;