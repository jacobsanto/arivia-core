
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGuestyMonitor } from "./hooks/useGuestyMonitor";
import GuestyMonitorPanel from "./components/GuestyMonitorPanel";
import GuestySyncControls from "./components/GuestySyncControls";
import GuestySyncErrorAlert from "./components/GuestySyncErrorAlert";
import GuestyLastErrorAlert from "./components/GuestyLastErrorAlert";
import { useGuestySyncActions } from "./hooks/useGuestySyncActions";

const GuestyIntegration = () => {
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

  // Use extracted Guesty sync actions hook
  const {
    isSyncing,
    isSendingTestWebhook,
    syncError,
    retryCountdown,
    handleSync,
    handleSendTestWebhook,
    handleUnmount,
  } = useGuestySyncActions({ refetchMonitor });

  // Unmount cleanup for retry timer
  React.useEffect(() => handleUnmount, [handleUnmount]);

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
