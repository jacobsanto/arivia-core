
import React, { useState } from 'react';
import { logger } from '@/services/logger';
import { useDevMode } from '@/contexts/DevModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, UserRole } from '@/types/auth';
import { ChevronDown, ChevronUp, Activity, Wifi, WifiOff, User as UserIcon, Settings, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const mockUsers: User[] = [
  {
    id: 'dev-admin',
    email: 'dev-admin@ariviavillas.com',
    name: 'Dev Admin',
    role: 'administrator' as UserRole,
    avatar: '/placeholder.svg'
  },
  {
    id: 'dev-manager',
    email: 'dev-manager@ariviavillas.com',
    name: 'Dev Manager',
    role: 'property_manager' as UserRole,
    avatar: '/placeholder.svg'
  },
  {
    id: 'dev-concierge',
    email: 'dev-concierge@ariviavillas.com',
    name: 'Dev Concierge',
    role: 'concierge' as UserRole,
    avatar: '/placeholder.svg'
  },
  {
    id: 'dev-housekeeping',
    email: 'dev-housekeeping@ariviavillas.com',
    name: 'Dev Housekeeping',
    role: 'housekeeping_staff' as UserRole,
    avatar: '/placeholder.svg'
  }
];

export const DevModePanel: React.FC = () => {
  const {
    isDevMode,
    settings,
    connectionStatus,
    currentMockUser,
    updateSettings,
    checkConnection,
    setMockUser,
    resetSettings,
    toggleDevMode
  } = useDevMode();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!isDevMode) return null;

  const formatLatency = (latency: number) => {
    if (latency < 100) return `${latency}ms`;
    if (latency < 1000) return `${latency}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  const handleMockUserChange = (value: string) => {
    logger.debug('DevModePanel', 'Mock user selection changed', { value });
    if (value === 'none') {
      setMockUser(null);
    } else {
      const user = mockUsers.find(u => u.id === value);
      if (user) {
        logger.debug('DevModePanel', 'Setting mock user', { user });
        setMockUser(user);
      }
    }
  };

  const handleTestConnection = async () => {
    logger.debug('DevModePanel', 'Test connection clicked');
    await checkConnection();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <CardTitle className="text-sm text-orange-800">Development Mode</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-600 hover:text-orange-800"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4 pt-0">
            {/* Connection Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connectionStatus.isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : connectionStatus.isConnected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Supabase</span>
                </div>
                <Badge variant={
                  connectionStatus.isChecking ? "secondary" :
                  connectionStatus.isConnected ? "default" : "destructive"
                }>
                  {connectionStatus.isChecking ? 'Testing...' :
                   connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              {connectionStatus.isConnected && !connectionStatus.isChecking && (
                <div className="text-xs text-muted-foreground">
                  Latency: {formatLatency(connectionStatus.latency)} • Last: {connectionStatus.lastChecked.toLocaleTimeString()}
                </div>
              )}
              
              {connectionStatus.error && !connectionStatus.isChecking && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {connectionStatus.error}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={connectionStatus.isChecking}
                className="w-full"
              >
                {connectionStatus.isChecking ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Activity className="h-3 w-3 mr-1" />
                )}
                {connectionStatus.isChecking ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bypass Authentication</span>
                <Switch
                  checked={settings.bypassAuth}
                  onCheckedChange={(checked) => updateSettings({ bypassAuth: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show Performance</span>
                <Switch
                  checked={settings.showPerformanceMetrics}
                  onCheckedChange={(checked) => updateSettings({ showPerformanceMetrics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable Mock Users</span>
                <Switch
                  checked={settings.enableMockUsers}
                  onCheckedChange={(checked) => updateSettings({ enableMockUsers: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* Mock User Selection */}
            {settings.enableMockUsers && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Mock User</span>
                  {currentMockUser && (
                    <Badge variant="secondary" className="text-xs">
                      Active: {currentMockUser.role}
                    </Badge>
                  )}
                </div>
                <Select
                  value={currentMockUser?.id || 'none'}
                  onValueChange={handleMockUserChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mock user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Mock User</SelectItem>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {currentMockUser && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Mock user active: {currentMockUser.name} with {currentMockUser.role} permissions
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="flex-1"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDevMode}
                className="flex-1"
              >
                <Settings className="h-3 w-3 mr-1" />
                Disable
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
