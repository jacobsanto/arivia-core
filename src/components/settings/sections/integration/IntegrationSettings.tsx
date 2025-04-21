
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Settings, Check, Loader2, RefreshCcw } from "lucide-react";
import { guestyService } from "@/services/guesty/guesty.service";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import GuestyPropertyList from "./integrations/guesty/GuestyPropertyList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ConnectionStatus = 'idle' | 'success' | 'error';

const IntegrationSettings = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Query latest sync status
  const { data: latestSync, refetch: refetchSync } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('service', 'guesty')
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      return data;
    }
  });

  const testGuestyConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      await guestyService.ensureValidToken();
      setConnectionStatus('success');
      toast.success("Guesty connection successful", {
        description: "Successfully authenticated with Guesty API"
      });
    } catch (error) {
      console.error("Guesty connection test failed:", error);
      setConnectionStatus('error');
      toast.error("Guesty connection failed", {
        description: error instanceof Error ? error.message : "Could not connect to Guesty API"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await guestyService.syncListings();
      await refetchSync();
      toast.success('Listings sync completed', {
        description: `Created: ${result.listingsCount} listings`
      });
    } catch (error) {
      console.error('Error syncing listings:', error);
      toast.error('Failed to sync listings');
    } finally {
      setIsSyncing(false);
    }
  }, [refetchSync]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Configuring Integrations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with external services to extend your application's functionality.
                  Currently supporting Guesty for property management integration.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Guesty Integration</h3>
              {latestSync && (
                <div className="text-sm text-muted-foreground">
                  Last sync: {new Date(latestSync.end_time).toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center space-x-4 rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Guesty API Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Test your connection to the Guesty API
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={testGuestyConnection} 
                  disabled={isTestingConnection}
                  className="shrink-0"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Connected
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing || connectionStatus !== 'success'}
                  className="shrink-0"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </div>

            {latestSync && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-2xl font-semibold">{latestSync.listings_created}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Updated</div>
                  <div className="text-2xl font-semibold">{latestSync.listings_updated}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Deleted</div>
                  <div className="text-2xl font-semibold">{latestSync.listings_deleted}</div>
                </div>
              </div>
            )}
            
            {connectionStatus === 'success' && (
              <Button 
                variant="secondary" 
                onClick={() => setShowPropertyList(!showPropertyList)}
                className="w-full"
              >
                {showPropertyList ? 'Hide Properties' : 'Show Properties'}
              </Button>
            )}
            
            {showPropertyList && connectionStatus === 'success' && (
              <GuestyPropertyList />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
