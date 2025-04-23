
import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { guestyService } from "@/services/guesty/guesty.service";
import GuestyStatusBadge from "./GuestyStatusBadge";
import GuestyMonitorPanel from "./components/GuestyMonitorPanel";
import { useGuestyMonitor } from "./hooks/useGuestyMonitor";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RefreshCcw, AlertTriangle, CalendarIcon, AlertCircle, X, Log } from "lucide-react";

const GuestyIntegration = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncErrorType, setSyncErrorType] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);

  // Use the monitor hook for panel data
  const { 
    data: monitor, 
    isLoading: monitorLoading, 
    refetch: refetchMonitor 
  } = useGuestyMonitor();

  // Fetch last error log from sync_logs
  const { data: lastSyncErrorLog } = useQuery({
    queryKey: ["guesty-last-error-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("id,sync_type,message,status,start_time")
        .eq("status", "error")
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    refetchInterval: 10000 // fresh error log every 10s
  });

  const handleSync = useCallback(async () => {
    setSyncError(null);
    setSyncErrorType(null);
    setRetryCountdown(null);

    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    setIsSyncing(true);

    try {
      // Call the Edge Function directly
      const { data, error } = await supabase.functions.invoke('guesty-listing-sync', {
        method: 'POST'
      });

      // Top-level error from Supabase
      if (error) {
        throw new Error(error.message || 'Failed to invoke sync function');
      }

      // API returned unsuccessful status
      if (!data?.success) {
        throw new Error(data?.error || 'Sync operation returned unsuccessful status');
      }

      toast.success('Listings sync completed', {
        description: `Successfully synced ${data.synced || 0} listings${
          data.archived > 0 ? ` and archived ${data.archived} obsolete listings` : ''
        }`
      });

      refetchMonitor();

    } catch (error) {
      console.error('Error syncing listings:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Recognize error type
      let type: string | null = null;
      if (/missing.*env|environment variable/i.test(errorMessage)) {
        type = "Missing Environment Variables";
      } else if (/auth/i.test(errorMessage) || /token/i.test(errorMessage) || /credential/i.test(errorMessage) || /Unauthorized/i.test(errorMessage)) {
        type = "Guesty API Auth Failed";
      } else if (/supabase/i.test(errorMessage)) {
        type = "Supabase Request Failed";
      } else if (/no listings|0 listings|empty listing/i.test(errorMessage)) {
        type = "Listing Response Empty";
      } else {
        type = "General Sync Error";
      }
      setSyncErrorType(type);

      setSyncError(
        type === "Missing Environment Variables" ? "❌ Environment variables are missing. Please check your Supabase project secrets."
        : type === "Guesty API Auth Failed" ? "❌ Guesty API authentication failed. Check your Guesty client credentials."
        : type === "Supabase Request Failed" ? "❌ Failed to request/insert into Supabase. Please verify Supabase configuration."
        : type === "Listing Response Empty" ? "❌ Guesty API returned no listings. Please ensure you have active properties."
        : `❌ Sync failed: ${errorMessage}`
      );

      setRetryCountdown(5);
      retryTimerRef.current = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (retryTimerRef.current) {
              clearInterval(retryTimerRef.current);
              retryTimerRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      toast.error('Failed to sync listings', {
        description: syncErrorType || errorMessage
      });
    } finally {
      setIsSyncing(false);
    }
  }, [refetchMonitor, syncErrorType]);

  // Helper to send mock test webhook
  const handleSendTestWebhook = useCallback(async () => {
    setIsSendingTestWebhook(true);
    const testPayload = {
      id: "test-reservation-id-123",
      listingId: "test-listing-999",
      guest: {
        fullName: "Jane Testuser",
        email: "testuser@example.com",
        phone: "+1234567890"
      },
      guest_name: "Jane Testuser",
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],  // day after
      status: "confirmed"
    };

    try {
      const { data, error } = await supabase.functions.invoke('guesty-reservation-webhook', {
        method: 'POST',
        body: testPayload,
        headers: {}
      });

      if (error) throw new Error(error.message || "Error sending webhook");

      if (!data?.success) {
        throw new Error(data?.error || "Test webhook not successful");
      }

      toast.success("Webhook sent successfully (test)", {
        description: "The mock reservation webhook was sent and logged.",
      });

      refetchMonitor();

    } catch (err) {
      toast.error("Webhook test failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      console.error("Test Webhook error:", err);
    } finally {
      setIsSendingTestWebhook(false);
    }
  }, [refetchMonitor]);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
      }
    };
  }, []);

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

      {/* Manual Controls: stacked for mobile/flex-row for desktop */}
      <div className="flex flex-col md:flex-row gap-2 mt-6">
        <Button
          variant="default"
          className="w-full md:w-auto flex items-center justify-center"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              <span>Syncing Listings...</span>
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
          onClick={handleSendTestWebhook}
          disabled={isSendingTestWebhook}
        >
          {isSendingTestWebhook ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              <span>Sending Webhook...</span>
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Send Test Webhook
            </>
          )}
        </Button>
      </div>

      {/* Inline sync error display: red ❌ + error message below sync controls */}
      {syncError && (
        <div
          className="flex items-center gap-2 mt-2 px-4 py-2 bg-red-50 text-red-800 rounded border border-red-200 text-sm"
          data-testid="inline-sync-error"
        >
          <X className="w-5 h-5 text-red-500" />
          <span className="font-medium">{syncError}</span>
          {retryCountdown !== null && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={handleSync}
            >
              Retry Now {retryCountdown > 0 ? `(${retryCountdown}s)` : ''}
            </Button>
          )}
        </div>
      )}

      {/* Show last sync error log if exists */}
      {lastSyncErrorLog && (
        <Alert variant="destructive" className="mt-4 border-2 border-red-400 bg-red-50">
          <Log className="h-4 w-4" />
          <AlertTitle className="flex gap-2 items-center">
            Sync Failure: <span className="text-xs font-normal text-muted-foreground">{lastSyncErrorLog.sync_type && lastSyncErrorLog.sync_type.replace("_", " ")}</span>
            <span className="ml-1 text-xs">{lastSyncErrorLog.start_time ? format(new Date(lastSyncErrorLog.start_time), "PPpp") : null}</span>
          </AlertTitle>
          <AlertDescription className="text-red-800 font-mono" data-testid="last-sync-error-log">
            {lastSyncErrorLog.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GuestyIntegration;

