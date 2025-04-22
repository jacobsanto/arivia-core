
import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { guestyService } from "@/services/guesty/guesty.service";
import GuestyStatusBadge from "./GuestyStatusBadge";
import GuestySyncControls from "./GuestySyncControls";
import GuestyPropertyList from "./GuestyPropertyList";
import GuestyApiMonitor from "./GuestyApiMonitor";
import { IntegrationHealthData } from "./types";

const GuestyIntegration = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingBookings, setIsSyncingBookings] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

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
      return data as IntegrationHealthData;
    }
  });

  const testGuestyConnection = async () => {
    setIsTestingConnection(true);
    try {
      await guestyService.ensureValidToken();
      await refetchHealth();
      toast.success("Guesty connection successful", {
        description: "Successfully authenticated with Guesty API"
      });
    } catch (error) {
      console.error("Guesty connection test failed:", error);
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
      if (result.success) {
        toast.success('Listings sync completed', {
          description: `Synced: ${result.listingsCount} listings${
            result.bookingsSynced ? ` and ${result.bookingsSynced} bookings` : ''
          }`
        });
      } else {
        // Display the specific error message from the API
        toast.error('Sync operation failed', {
          description: result.message || 'Failed to sync with Guesty API'
        });
      }
    } catch (error) {
      console.error('Error syncing listings:', error);
      toast.error('Failed to sync listings', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSyncing(false);
      refetchHealth();
    }
  }, [refetchHealth]);

  const handleSyncBookings = useCallback(async () => {
    setIsSyncingBookings(true);
    setSyncProgress({ current: 0, total: 0 });
    
    // Show an initial toast that the sync has started
    const toastId = toast.loading('Starting bookings sync...', {
      description: 'This may take a few minutes to complete'
    });
    
    try {
      const result = await guestyService.syncAllBookings();
      
      if (result.success) {
        toast.success('Bookings sync completed', {
          description: `Synced: ${result.bookingsSynced} bookings across ${result.listingsCount} properties`,
          id: toastId
        });
      } else {
        toast.error('Bookings sync failed', {
          description: result.message || 'Failed to sync bookings with Guesty API',
          id: toastId
        });
      }
    } catch (error) {
      console.error('Error syncing bookings:', error);
      toast.error('Failed to sync bookings', {
        description: error instanceof Error ? error.message : 'Unknown error',
        id: toastId
      });
    } finally {
      setIsSyncingBookings(false);
      setSyncProgress({ current: 0, total: 0 });
      refetchHealth();
    }
  }, [refetchHealth]);

  return (
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
            <GuestyStatusBadge status={integrationHealth?.status} />
          </div>
          {integrationHealth?.last_error && (
            <p className="text-sm text-destructive mt-1">
              Error: {integrationHealth.last_error}
            </p>
          )}
          {integrationHealth?.last_bookings_synced && (
            <p className="text-xs text-muted-foreground mt-1">
              Last bookings sync: {format(new Date(integrationHealth.last_bookings_synced), 'PPp')}
            </p>
          )}
        </div>
        <GuestySyncControls
          onTest={testGuestyConnection}
          onSync={handleSync}
          onSyncBookings={handleSyncBookings}
          isTesting={isTestingConnection}
          isSyncing={isSyncing}
          isSyncingBookings={isSyncingBookings}
          isConnected={integrationHealth?.status === 'connected'}
        />
      </div>
      
      <GuestyApiMonitor />

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
  );
};

export default GuestyIntegration;
