
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, ArrowDownCircle, RefreshCcw, BarChart3, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

const GuestyApiMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState("usage");
  const { toast } = useToast();
  
  // Get API usage data - last 50 records
  const { data: apiUsage, isLoading, refetch } = useQuery({
    queryKey: ["guesty-api-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guesty_api_usage")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // Get rate limit errors in the last 24 hours
  const { data: rateLimitErrors } = useQuery({
    queryKey: ["guesty-rate-limit-errors"],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data, error } = await supabase
        .from("guesty_api_usage")
        .select("*")
        .eq("status", 429)
        .gte("timestamp", oneDayAgo.toISOString())
        .order("timestamp", { ascending: false });
        
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,  // 1 minute
  });

  // Show toast for recent rate limit errors
  React.useEffect(() => {
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
  }, [rateLimitErrors, toast]);

  const getLatestUsageByEndpoint = () => {
    if (!apiUsage) return [];
    const endpointMap = new Map();
    
    apiUsage.forEach((usage) => {
      if (!endpointMap.has(usage.endpoint)) {
        endpointMap.set(usage.endpoint, usage);
      }
    });
    
    return Array.from(endpointMap.values());
  };

  const getEndpointUsageCounts = () => {
    if (!apiUsage) return [];
    
    // Calculate calls in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentCalls = apiUsage.filter(u => new Date(u.timestamp) > oneDayAgo);
    
    // Count by endpoint
    const endpointCounts = {};
    const endpointStatuses = {};
    
    recentCalls.forEach(call => {
      const endpoint = call.endpoint || 'unknown';
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
      
      // Track statuses (for color coding)
      if (!endpointStatuses[endpoint]) {
        endpointStatuses[endpoint] = {
          success: 0,
          error: 0,
          rateLimit: 0
        };
      }
      
      if (call.status === 429) {
        endpointStatuses[endpoint].rateLimit++;
      } else if (call.status >= 400) {
        endpointStatuses[endpoint].error++;
      } else {
        endpointStatuses[endpoint].success++;
      }
    });
    
    // Convert to array and sort by count
    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({
        endpoint,
        count,
        status: endpointStatuses[endpoint]
      }))
      .sort((a, b) => (b.count as number) - (a.count as number));
  };

  const latestUsage = getLatestUsageByEndpoint();
  const endpointUsage = getEndpointUsageCounts();
  
  const isRateLimited = latestUsage.some(
    (usage) => usage.remaining && usage.remaining < 10
  );
  
  const formatEndpointName = (endpoint: string) => {
    if (!endpoint) return "Unknown";
    return endpoint.replace(/^\/v\d+\//, "").replace(/-/g, " ");
  };
  
  const calculateTimeToReset = (reset: string | null) => {
    if (!reset) return "Unknown";
    
    try {
      const resetDate = new Date(reset);
      const now = new Date();
      
      if (resetDate <= now) return "Available now";
      
      return formatDistanceToNow(resetDate, { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  // Calculate totals for the summary
  const getTotalCalls24h = () => {
    if (!apiUsage) return 0;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return apiUsage.filter(u => new Date(u.timestamp) > oneDayAgo).length;
  };

  const getMostUsedEndpoint = () => {
    if (!endpointUsage.length) return "None";
    return formatEndpointName(endpointUsage[0].endpoint);
  };

  const getLastRateLimitError = () => {
    if (!rateLimitErrors || rateLimitErrors.length === 0) return "None";
    return format(new Date(rateLimitErrors[0].timestamp), "yyyy-MM-dd HH:mm:ss");
  };

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
          <CardContent>
            <div className="space-y-3 text-sm">
              {latestUsage.map((usage) => (
                <div key={usage.endpoint} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium capitalize">
                      {formatEndpointName(usage.endpoint)}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{calculateTimeToReset(usage.reset)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        usage.rate_limit 
                          ? ((usage.rate_limit - (usage.remaining || 0)) / usage.rate_limit) * 100
                          : 0
                      }
                      className="h-2"
                    />
                    <span className="text-xs whitespace-nowrap">
                      {usage.remaining}/{usage.rate_limit} left
                    </span>
                  </div>
                </div>
              ))}

              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowDownCircle className="h-3.5 w-3.5" /> 
                <span>Updated {new Date(latestUsage[0]?.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="stats" className="m-0">
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground mb-1">Calls in last 24h</div>
                  <div className="font-medium text-base">{getTotalCalls24h()}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground mb-1">Most used endpoint</div>
                  <div className="font-medium text-base truncate">{getMostUsedEndpoint()}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground mb-1">Last rate limit error</div>
                  <div className="font-medium text-base truncate">{getLastRateLimitError()}</div>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-xs mb-2">Endpoint Usage (last 24h)</div>
                <div className="space-y-2">
                  {endpointUsage.map((item) => (
                    <div key={item.endpoint}>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="truncate">{formatEndpointName(item.endpoint)}</span>
                        <span>{item.count} calls</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                        {/* Success bar */}
                        {item.status.success > 0 && (
                          <div 
                            className="bg-emerald-500 h-full" 
                            style={{ width: `${(item.status.success / item.count) * 100}%` }}
                          />
                        )}
                        {/* Error bar */}
                        {item.status.error > 0 && (
                          <div 
                            className="bg-amber-500 h-full" 
                            style={{ width: `${(item.status.error / item.count) * 100}%` }}
                          />
                        )}
                        {/* Rate limit bar */}
                        {item.status.rateLimit > 0 && (
                          <div 
                            className="bg-red-500 h-full" 
                            style={{ width: `${(item.status.rateLimit / item.count) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Color key */}
                <div className="flex gap-4 text-xs mt-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Success</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Error</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Rate Limited</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
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
