
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw, TrendingUp, BarChart3, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuestyApiMonitor } from './hooks/useGuestyApiMonitor';
import { ApiUsageTab } from './components/ApiUsageTab';
import { SyncHistoryTab } from './components/SyncHistoryTab';
import { toast } from 'sonner';

const GuestyApiMonitor: React.FC = () => {
  const {
    data,
    apiUsage,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    handleRefresh,
    isRefreshing,
    isLoadingUsage
  } = useGuestyApiMonitor();
  
  const refreshData = async () => {
    toast.promise(handleRefresh(), {
      loading: 'Refreshing API monitor data...',
      success: 'API monitor data refreshed',
      error: 'Failed to refresh API monitor data'
    });
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
          <p className="text-xs text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={refreshData} variant="outline" size="sm" className="mt-2">
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshData} 
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
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
            
            <TabsContent value="usage">
              {isLoadingUsage ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(data.quotaUsage).length > 0 ? (
                <ApiUsageTab 
                  remainingRequests={data.remainingRequests}
                  quotaUsage={data.quotaUsage}
                />
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                  <p>No API usage data available yet</p>
                  <p className="text-xs mt-1">Usage data will appear after API calls are made</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {data.recentSyncs && data.recentSyncs.length > 0 ? (
                <SyncHistoryTab recentSyncs={data.recentSyncs} />
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                  <p>No sync history available</p>
                  <p className="text-xs mt-1">History will appear after syncs are performed</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
