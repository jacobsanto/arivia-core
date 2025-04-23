
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
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCcw, AlertTriangle, HelpCircle, CalendarIcon } from "lucide-react";
import GuestyMonitorPanel from "./components/GuestyMonitorPanel";
import { useGuestyMonitor } from "./hooks/useGuestyMonitor";

const GuestyIntegration = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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

  const progressPercent = syncProgress.total > 0 
    ? Math.min(100, Math.round((syncProgress.current / syncProgress.total) * 100))
    : 0;

  // Use new hook for monitor panel data
  const { data: monitor, isLoading: monitorLoading, refetch: refetchMonitor } = useGuestyMonitor();

  // Responsive: stack monitor panel on mobile; controls below
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Guesty Integration</h3>
      <GuestyMonitorPanel
        isConnected={monitor?.isConnected ?? false}
        lastListingSync={monitor?.lastListingSync}
        lastBookingsWebhook={monitor?.lastBookingsWebhook}
        totalListings={monitor?.totalListings ?? 0}
        totalBookings={monitor?.totalBookings ?? 0}
        avgSyncDuration={monitor?.avgSyncDuration ?? null}
        logs={monitor?.logs ?? []}
        isLoading={monitorLoading}
      />

      {/* --- Manual Controls: stacked for mobile/flex-row for desktop --- */}
      <div className="flex flex-col md:flex-row gap-2 mt-6">
        <Button
          variant="default"
          className="w-full md:w-auto flex items-center justify-center"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <span className="mr-2">Syncing</span>
              <RefreshCcw className="animate-spin h-4 w-4" />
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sync Listings Now
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center justify-center"
          onClick={() => toast.info("Dev feature: Send Test Webhook not implemented yet")}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Send Test Webhook
        </Button>
      </div>
      {/* --- End Controls --- */}

      {/* You can add the old GuestyApiMonitor section optionally below if needed
      <GuestyApiMonitor />
      */}

      {/* Show property list toggle if needed
      */}
    </div>
  );
};

export default GuestyIntegration;
