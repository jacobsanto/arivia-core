import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Settings, Check, Loader2, RefreshCcw, AlertTriangle, X } from "lucide-react";
import { guestyService } from "@/services/guesty/guesty.service";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import GuestyPropertyList from "./integrations/guesty/GuestyPropertyList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const IntegrationSettings = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Query latest sync status and integration health
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

  // Query integration health status
  const { data: integrationHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['integration-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_health')
        .select('*')
        .eq('provider', 'guesty')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching integration health:', error);
        return null;
      }
      return data;
    }
  });

  // Function to display the status badge with appropriate styling
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success" className="gap-1">
            <Check className="h-3.5 w-3.5" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <X className="h-3.5 w-3.5" />
            Disconnected
          </Badge>
        );
    }
  };

  const testGuestyConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      await guestyService.ensureValidToken();
      
      // Update integration health
      const { error } = await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'connected',
          last_synced: new Date().toISOString(),
          last_error: null
        }, { onConflict: 'provider' });

      if (error) {
        console.error('Error updating integration health:', error);
      }

      await refetchHealth();
      
      toast.success("Guesty connection successful", {
        description: "Successfully authenticated with Guesty API"
      });
    } catch (error) {
      console.error("Guesty connection test failed:", error);
      
      // Update integration health with error
      const { error: updateError } = await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'error',
          last_error: error instanceof Error ? error.message : 'Unknown error'
        }, { onConflict: 'provider' });

      if (updateError) {
        console.error('Error updating integration health:', updateError);
      }

      await refetchHealth();
      
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
              {integrationHealth?.last_synced && (
                <div className="text-sm text-muted-foreground">
                  Last synced: {format(new Date(integrationHealth.last_synced), 'PPpp')}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center space-x-4 rounded-lg border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Guesty API Connection</h4>
                  {getStatusBadge(integrationHealth?.status)}
                </div>
                {integrationHealth?.last_error && (
                  <p className="text-sm text-destructive mt-1">
                    Error: {integrationHealth.last_error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                  ) : (
                    'Test Connection'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing || integrationHealth?.status !== 'connected'}
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
            
            {integrationHealth?.status === 'connected' && (
              <Button 
                variant="secondary" 
                onClick={() => setShowPropertyList(!showPropertyList)}
                className="w-full"
              >
                {showPropertyList ? 'Hide Properties' : 'Show Properties'}
              </Button>
            )}
            
            {showPropertyList && integrationHealth?.status === 'connected' && (
              <GuestyPropertyList />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
