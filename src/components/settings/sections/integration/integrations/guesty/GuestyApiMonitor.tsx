
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, ArrowDownCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const GuestyApiMonitor: React.FC = () => {
  const { data: apiUsage, isLoading } = useQuery({
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

  const latestUsage = getLatestUsageByEndpoint();
  const isRateLimited = latestUsage.some(
    (usage) => usage.remaining && usage.remaining < 10
  );
  
  const formatEndpointName = (endpoint: string) => {
    if (!endpoint) return "Unknown";
    return endpoint.replace(/^\/v\d+\//, "").replace(/-/g, " ");
  };
  
  const calculateTimeToReset = (reset: number | null) => {
    if (!reset) return "Unknown";
    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = reset - now;
    
    if (diffSeconds <= 0) return "Available now";
    
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `${minutes}m ${seconds}s`;
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
    return null;
  }

  return (
    <Card className={`bg-muted/30 overflow-hidden ${isRateLimited ? "border-yellow-300" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-base md:text-lg">
          <span>Guesty API Status</span>
          {isRateLimited && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Rate Limited</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
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
    </Card>
  );
};

export default GuestyApiMonitor;
