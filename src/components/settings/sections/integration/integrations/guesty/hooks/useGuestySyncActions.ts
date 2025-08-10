
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseGuestySyncActionsProps {
  refetchMonitor: () => void;
}
export function useGuestySyncActions({ refetchMonitor }: UseGuestySyncActionsProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncErrorType, setSyncErrorType] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  // Sync Listings
  const handleSync = useCallback(async () => {
    setSyncError(null); setSyncErrorType(null); setRetryCountdown(null);
    clearRetryTimer();
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
            clearRetryTimer();
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

  // Test Webhook
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
      // still log the error
      console.error("Test Webhook error:", err);
    } finally {
      setIsSendingTestWebhook(false);
    }
  }, [refetchMonitor]);

  // Cleanup on unmount
  const handleUnmount = useCallback(() => {
    clearRetryTimer();
  }, []);

  return {
    isSyncing,
    isSendingTestWebhook,
    syncError,
    syncErrorType,
    retryCountdown,
    handleSync,
    handleSendTestWebhook,
    handleUnmount,
  };
}
