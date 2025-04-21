import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format, formatDistance } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiUsage } from "./types";

interface SyncLog {
  id: string;
  status: 'in_progress' | 'completed' | 'error';
  start_time: string;
  end_time?: string;
  duration?: number;
  message?: string;
  retry_count?: number;
  next_retry_time?: string;
}

interface HealthCheckResponse {
  status: string;
  lastSynced: string | null;
  lastError: string | null;
  isRateLimited: boolean;
  remainingRequests: number | null;
  nextSyncTime: string | null;
  quotaUsage: Record<string, {
    total: number;
    remaining: number;
    limit: number;
  }>;
  recentSyncs: SyncLog[];
}

const GuestyApiMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState("usage");
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['guesty-health-check'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke<{
        success: boolean;
        health: HealthCheckResponse;
      }>('guesty-health-check');
      
      return data?.health;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
  
  const { data: apiUsage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['guesty-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_api_usage')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data as ApiUsage[];
    }
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-amber-500 hover:bg-amber-600';
    }
  };
  
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            API Monitor Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load Guesty API health status</p>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Guesty API Monitor</CardTitle>
            <CardDescription>
              Track API usage and rate limit status
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getStatusColor(data.status)}>
                {data.status === 'connected' ? (
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                )}
                {data.status || 'Unknown'}
              </Badge>
              
              {data.isRateLimited && (
                <Badge variant="destructive">Rate Limited</Badge>
              )}
              
              {data.lastSynced && (
                <span className="text-xs text-muted-foreground">
                  Last synced: {formatDistance(new Date(data.lastSynced), new Date(), { addSuffix: true })}
                </span>
              )}
            </div>
            
            {data.nextSyncTime && (
              <div className="rounded-md bg-amber-50 p-2 border border-amber-200 text-amber-800 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Next sync available: {format(new Date(data.nextSyncTime), 'PPpp')}</span>
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="usage">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  API Usage
                </TabsTrigger>
                <TabsTrigger value="history">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Sync History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="space-y-4">
                {data.remainingRequests !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Quota Remaining</span>
                      <span className="font-medium">{data.remainingRequests}</span>
                    </div>
                    <Progress value={data.remainingRequests} className="h-2" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Endpoint Usage</h3>
                  {Object.entries(data.quotaUsage).map(([endpoint, usage]) => (
                    <div key={endpoint} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>{endpoint}</span>
                        <span>{usage.remaining}/{usage.limit} remaining</span>
                      </div>
                      <Progress 
                        value={(usage.remaining / usage.limit) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {data.recentSyncs?.map(sync => (
                    <div 
                      key={sync.id} 
                      className="text-xs p-2 rounded-md border mb-1"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {format(new Date(sync.start_time), 'MMM d, h:mm a')}
                        </span>
                        <Badge 
                          variant={
                            sync.status === 'completed' ? 'success' : 
                            sync.status === 'error' ? 'destructive' : 
                            'outline'
                          }
                          className="text-[10px] h-5"
                        >
                          {sync.status}
                        </Badge>
                      </div>
                      {sync.duration && (
                        <div className="text-muted-foreground mt-1">
                          Duration: {(sync.duration / 1000).toFixed(1)}s
                        </div>
                      )}
                      {sync.retry_count > 0 && (
                        <div className="text-amber-600 mt-1">
                          Retry count: {sync.retry_count}
                        </div>
                      )}
                      {sync.message && (
                        <div className="text-muted-foreground mt-1 line-clamp-1">
                          {sync.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No API health data available
          </div>
        )}
      </CardContent>
      {data?.lastError && (
        <CardFooter className="pt-0 pb-3">
          <div className="w-full rounded-md bg-red-50 p-2 border border-red-200 text-red-800 text-xs">
            <div className="font-medium">Last Error:</div>
            <div className="truncate">{data.lastError}</div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default GuestyApiMonitor;
