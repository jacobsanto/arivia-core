
import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGuestyMonitor } from "./hooks/useGuestyMonitor";
import GuestyMonitorPanel from "./components/GuestyMonitorPanel";
import GuestySyncControls from "./components/GuestySyncControls";
import GuestySyncErrorAlert from "./components/GuestySyncErrorAlert";
import GuestyLastErrorAlert from "./components/GuestyLastErrorAlert";

const GuestyIntegration = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncErrorType, setSyncErrorType] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { 
    data: monitor, 
    isLoading: monitorLoading, 
    refetch: refetchMonitor 
  } = useGuestyMonitor();

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
    refetchInterval: 10000
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
      const { data, error } = await supabase.functions.invoke('guesty-listing-sync', {
        method: 'POST'
      });

      if (error) throw new Error(error.message || 'Failed to invoke sync function');
      if (!data?.success) throw new Error(data?.error || 'Sync operation returned unsuccessful status');

      toast.success('Listings sync completed', {
        description: `Successfully synced ${data.synced || 0} listings${data.archived > 0 ? ` and archived ${data.archived} obsolete listings` : ''}`
      });

      refetchMonitor();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let type: string | null = null;
      if (/missing.*env|environment variable/i.test(errorMessage)) type = "Missing Environment Variables";
      else if (/auth/i.test(errorMessage) || /token/i.test(errorMessage) || /credential/i.test(errorMessage) || /Unauthorized/i.test(errorMessage)) type = "Guesty API Auth Failed";
      else if (/supabase/i.test(errorMessage)) type = "Supabase Request Failed";
      else if (/no listings|0 listings|empty listing/i.test(errorMessage)) type = "Listing Response Empty";
      else type = "General Sync Error";
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
        description: type || errorMessage
      });
    } finally {
      setIsSyncing(false);
    }
  }, [refetchMonitor]);

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
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      status: "confirmed"
    };

    try {
      const { data, error } = await supabase.functions.invoke('guesty-reservation-webhook', {
        method: 'POST',
        body: testPayload,
        headers: {}
      });

      if (error) throw new Error(error.message || "Error sending webhook");
      if (!data?.success) throw new Error(data?.error || "Test webhook not successful");

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

      <GuestySyncControls
        onSync={handleSync}
        onSendTestWebhook={handleSendTestWebhook}
        isSyncing={isSyncing}
        isSendingTestWebhook={isSendingTestWebhook}
      />

      <GuestySyncErrorAlert
        syncError={syncError}
        retryCountdown={retryCountdown}
        onRetry={handleSync}
      />

      <GuestyLastErrorAlert lastSyncErrorLog={lastSyncErrorLog} />
    </div>
  );
};

export default GuestyIntegration;
