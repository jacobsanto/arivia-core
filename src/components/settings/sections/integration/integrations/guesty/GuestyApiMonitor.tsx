import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiUsageTab } from './components/ApiUsageTab';
import { Loader2, Info } from 'lucide-react';
import { ApiUsage, IntegrationHealthData } from './types';

const GuestyApiMonitor = () => {
  const [activeTab, setActiveTab] = useState("usage");

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
    },
  });

  const { data: integrationHealth } = useQuery({
    queryKey: ['integration-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_health')
        .select('*')
        .eq('provider', 'guesty')
        .maybeSingle();
      
      if (error) throw error;
      // Safely cast to IntegrationHealthData
      return data as IntegrationHealthData;
    }
  });

  const processApiUsage = () => {
    if (!apiUsage?.length) return { remainingRequests: null, quotaUsage: {} };

    let remainingRequests = null;
    const latestAuthUsage = apiUsage.find(item => item.endpoint === 'auth');
    if (latestAuthUsage) {
      remainingRequests = latestAuthUsage.remaining;
    }

    // Group by endpoint and get the latest data for each endpoint
    const endpoints: Record<string, { endpoint: string; timestamp: string }[]> = {};
    apiUsage.forEach(item => {
      if (!endpoints[item.endpoint]) {
        endpoints[item.endpoint] = [];
      }
      endpoints[item.endpoint].push(item);
    });

    // Create quota usage object with the latest data for each endpoint
    const quotaUsage: Record<string, { total: number; remaining: number; limit: number }> = {};
    Object.keys(endpoints).forEach(endpoint => {
      // Sort by timestamp desc and get the latest
      const latest = endpoints[endpoint].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      if (latest && endpoint !== 'auth') { // Skip auth endpoint in the detailed list
        const usage = apiUsage.find(item => 
          item.endpoint === latest.endpoint && 
          item.timestamp === latest.timestamp
        );
        if (usage) {
          quotaUsage[endpoint] = {
            total: usage.rate_limit,
            remaining: usage.remaining,
            limit: usage.rate_limit
          };
        }
      }
    });

    return { remainingRequests, quotaUsage };
  };

  const { remainingRequests, quotaUsage } = processApiUsage();

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">API Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="usage">API Usage</TabsTrigger>
            <TabsTrigger value="sync">Sync Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="mt-0">
            {isLoadingUsage ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ApiUsageTab 
                remainingRequests={remainingRequests} 
                quotaUsage={quotaUsage}
              />
            )}
          </TabsContent>
          
          <TabsContent value="sync" className="mt-0">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-1">Last Listing Sync</h3>
                <p className="text-sm text-muted-foreground">
                  {integrationHealth?.last_synced ? (
                    <>
                      {format(new Date(integrationHealth.last_synced), "PPpp")}
                      <span className="text-xs ml-2">
                        ({formatDistanceToNow(new Date(integrationHealth.last_synced), { addSuffix: true })})
                      </span>
                    </>
                  ) : (
                    "Never synced"
                  )}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Last Bookings Sync</h3>
                <p className="text-sm text-muted-foreground">
                  {integrationHealth?.last_bookings_synced ? (
                    <>
                      {format(new Date(integrationHealth.last_bookings_synced), "PPpp")}
                      <span className="text-xs ml-2">
                        ({formatDistanceToNow(new Date(integrationHealth.last_bookings_synced), { addSuffix: true })})
                      </span>
                    </>
                  ) : (
                    "Never synced"
                  )}
                </p>
              </div>

              {integrationHealth?.is_rate_limited && (
                <div className="rounded-md bg-amber-50 p-3 text-sm border border-amber-200">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Rate limit in effect</p>
                      <p className="text-amber-700 mt-1">
                        API rate limit reached. Please wait before attempting to sync again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GuestyApiMonitor;
