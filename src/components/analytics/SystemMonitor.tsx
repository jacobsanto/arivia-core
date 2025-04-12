
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Settings, Database, Layers, TrendingUp } from "lucide-react";

// Sample system data for demonstration
const systemData = {
  cpu: 32,
  memory: 68,
  storage: 45,
  network: 22,
  uptime: "99.98%",
  lastBackup: "8 hours ago",
  activeUsers: 14,
  apiRequests: 287
};

export const SystemMonitor = () => {
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
          <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
            Healthy
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
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
      <Progress value={value} className="h-1.5" indicatorClassName={getProgressColor(value)} />
    </div>
  );
};
