
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Settings, Database, Layers, TrendingUp, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Sample system data for initial state
const initialSystemData = {
  cpu: 32,
  memory: 68,
  storage: 45,
  network: 22,
  uptime: "99.98%",
  lastBackup: "8 hours ago",
  activeUsers: 14,
  apiRequests: 287,
  lastUpdated: new Date()
};

export const SystemMonitor = () => {
  const [systemData, setSystemData] = useState(initialSystemData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  // Function to simulate fetching new system data
  const refreshSystemData = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate some random fluctuations in the metrics
      const newData = {
        cpu: Math.min(Math.max(systemData.cpu + Math.floor(Math.random() * 20) - 10, 5), 95),
        memory: Math.min(Math.max(systemData.memory + Math.floor(Math.random() * 15) - 7, 30), 95),
        storage: Math.min(Math.max(systemData.storage + Math.floor(Math.random() * 5) - 2, 40), 90),
        network: Math.min(Math.max(systemData.network + Math.floor(Math.random() * 30) - 15, 5), 90),
        uptime: "99.98%",
        lastBackup: "8 hours ago",
        activeUsers: Math.floor(Math.random() * 10) + 10,
        apiRequests: systemData.apiRequests + Math.floor(Math.random() * 50),
        lastUpdated: new Date()
      };
      
      setSystemData(newData);
      setIsRefreshing(false);
      
      // Check for critical alerts
      checkAlerts(newData);
    }, 800);
  };
  
  // Function to check for critical system alerts
  const checkAlerts = (data: typeof systemData) => {
    if (data.cpu > 85) {
      toast({
        title: "High CPU Usage Alert",
        description: `CPU usage has reached ${data.cpu}%`,
        variant: "destructive",
      });
    }
    
    if (data.memory > 90) {
      toast({
        title: "Memory Usage Critical",
        description: `Memory usage has reached ${data.memory}%`,
        variant: "destructive",
      });
    }
  };
  
  // Setup auto-refresh interval if enabled
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshSystemData();
      }, 15000); // Refresh every 15 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, systemData]);

  const toggleAutoRefresh = () => {
    const newState = !autoRefresh;
    setAutoRefresh(newState);
    
    toast({
      title: newState ? "Auto-refresh enabled" : "Auto-refresh disabled",
      description: newState ? "System metrics will update every 15 seconds" : "System metrics update paused",
    });
  };

  // System health status based on metrics
  const getSystemHealth = () => {
    if (systemData.cpu > 80 || systemData.memory > 85) return "critical";
    if (systemData.cpu > 60 || systemData.memory > 75) return "warning";
    return "healthy";
  };
  
  const systemHealth = getSystemHealth();
  const healthColors = {
    healthy: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
    critical: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
  };
  
  const healthLabels = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical"
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`${healthColors[systemHealth]} text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
              <span className={`h-2 w-2 ${systemHealth === "critical" ? "bg-red-500" : systemHealth === "warning" ? "bg-amber-500" : "bg-emerald-500"} rounded-full`}></span>
              {healthLabels[systemHealth]}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`h-7 w-7 ${autoRefresh ? 'bg-primary/10' : ''}`}
                    onClick={toggleAutoRefresh}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{autoRefresh ? 'Disable' : 'Enable'} auto-refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>Last updated: {systemData.lastUpdated.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSystemData}
              disabled={isRefreshing}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SystemMetricCard 
              title="CPU" 
              value={systemData.cpu} 
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <SystemMetricCard 
              title="Memory" 
              value={systemData.memory} 
              icon={<Database className="h-4 w-4" />}
            />
            <SystemMetricCard 
              title="Storage" 
              value={systemData.storage} 
              icon={<Layers className="h-4 w-4" />}
            />
            <SystemMetricCard 
              title="Network" 
              value={systemData.network} 
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">System Uptime</p>
              <p className="text-sm font-medium">{systemData.uptime}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="text-sm font-medium">{systemData.lastBackup}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-sm font-medium">{systemData.activeUsers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">API Requests (24h)</p>
              <p className="text-sm font-medium">{systemData.apiRequests}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SystemMetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const SystemMetricCard: React.FC<SystemMetricCardProps> = ({ title, value, icon }) => {
  const getProgressColor = (value: number) => {
    if (value < 40) return "bg-emerald-500";
    if (value < 70) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
            {icon}
          </div>
          <span className="text-xs font-medium">{title}</span>
        </div>
        <span className="text-xs font-mono">{value}%</span>
      </div>
      <Progress 
        value={value} 
        className="h-1.5" 
        style={{ 
          "--progress-indicator-color": getProgressColor(value) 
        } as React.CSSProperties}
      />
    </div>
  );
};
