
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheck, AlertCircle, RefreshCcw, Monitor, SaveAsReportButton } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";

interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  message?: string;
}

export const SystemMonitor: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusData, setStatusData] = useState<SystemStatus[]>([
    { name: 'Database Connection', status: 'healthy', lastCheck: 'Today, 08:23 AM' },
    { name: 'Guesty API Connection', status: 'healthy', lastCheck: 'Today, 08:23 AM' },
    { name: 'Storage Service', status: 'healthy', lastCheck: 'Today, 08:23 AM' },
    { name: 'Notification Service', status: 'warning', lastCheck: 'Today, 08:23 AM', message: 'High latency detected' },
  ]);

  const refreshStatus = () => {
    setIsRefreshing(true);
    
    // Simulate API call to refresh status
    setTimeout(() => {
      // In a real app, we'd fetch real data here
      setStatusData(prev => prev.map(item => ({
        ...item,
        lastCheck: 'Just now'
      })));
      
      setIsRefreshing(false);
      toastService.success("System status refreshed");
    }, 1000);
  };
  
  // Auto-refresh status every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeVariant = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const saveAsReport = () => {
    // We'll implement report saving functionality here
    toastService.info("Creating system status report...");
    
    setTimeout(() => {
      toastService.success("System status report saved", {
        description: "The report can be accessed from the Reports section."
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>
              Health and performance of connected services
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={refreshStatus} disabled={isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusData.map((status, index) => (
            <div key={index} className="flex items-center justify-between pb-2 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                {status.status === 'healthy' ? (
                  <CircleCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="font-medium text-sm">{status.name}</p>
                  {status.message && (
                    <p className="text-xs text-muted-foreground">{status.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(status.status)}>
                  {status.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {status.lastCheck}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-right">
          <Button variant="outline" size="sm" onClick={saveAsReport}>
            Save as Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
