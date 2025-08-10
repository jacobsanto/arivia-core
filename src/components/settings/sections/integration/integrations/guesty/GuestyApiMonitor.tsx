
import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCcw, BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useApiUsageData } from "./hooks/useApiUsageData";
import { LiveStatusTab } from "./components/LiveStatusTab";
import { StatisticsTab } from "./components/StatisticsTab";
import {
  getLatestUsageByEndpoint,
  getEndpointUsageCounts,
  getTotalCalls24h,
  getMostUsedEndpoint,
  getLastRateLimitError,
  formatEndpointName
} from "./utils/apiUsageUtils";

const GuestyApiMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState("usage");
  const { apiUsage, rateLimitErrors, isLoading, refetch } = useApiUsageData();

  // Show toast for recent rate limit errors
  useEffect(() => {
    if (rateLimitErrors && rateLimitErrors.length > 0) {
      const mostRecent = rateLimitErrors[0];
      const timeSinceError = new Date().getTime() - new Date(mostRecent.timestamp).getTime();
      
      // Only show for errors in the last 5 minutes
      if (timeSinceError < 5 * 60 * 1000) {
        toast.warning("⚠️ API limit hit — some syncs may fail", {
          description: `${mostRecent.endpoint} endpoint hit rate limit. Recovery in progress.`,
          duration: 8000,
        });
      }
    }
  }, [rateLimitErrors]);

  const latestUsage = getLatestUsageByEndpoint(apiUsage || []);
  const endpointUsage = getEndpointUsageCounts(apiUsage || []);
  
  const isRateLimited = latestUsage.some(
    (usage) => usage.remaining && usage.remaining < 10
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="bg-muted/30 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!apiUsage || apiUsage.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">API Usage Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-4 text-muted" />
            <p>No API usage data available yet</p>
            <p className="text-sm mt-1">Data will appear after syncing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-muted/30 overflow-hidden ${isRateLimited ? "border-yellow-300" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-base md:text-lg">
          <span>API Usage Monitor</span>
          {isRateLimited && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Rate Limited</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 mb-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              <span>Live Status</span>
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="usage" className="m-0">
          <LiveStatusTab latestUsage={latestUsage} />
        </TabsContent>
        
        <TabsContent value="stats" className="m-0">
          <StatisticsTab
            totalCalls24h={getTotalCalls24h(apiUsage)}
            mostUsedEndpoint={getMostUsedEndpoint(endpointUsage)}
            lastRateLimitError={getLastRateLimitError(rateLimitErrors || [])}
            endpointUsage={endpointUsage}
            formatEndpointName={formatEndpointName}
          />
        </TabsContent>
      </Tabs>
      
      <CardFooter className="pt-0">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRefresh} 
          className="text-xs h-7 px-2 w-full flex items-center justify-center gap-1"
        >
          <RefreshCcw className="h-3 w-3" />
          <span>Refresh Data</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuestyApiMonitor;
