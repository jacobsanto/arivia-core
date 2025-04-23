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
import { RefreshCcw, AlertTriangle, CalendarIcon, AlertCircle } from "lucide-react";

const GuestyIntegration = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);

  // Use the monitor hook for panel data
  const { 
    data: monitor, 
    isLoading: monitorLoading, 
    refetch: refetchMonitor 
  } = useGuestyMonitor();

  const handleSync = useCallback(async () => {
    // Clear any existing error state and countdown
    setSyncError(null);
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
      
      if (error) {
        throw new Error(error.message || 'Failed to invoke sync function');
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Sync operation returned unsuccessful status');
      }
      
      // Success case
      toast.success('Listings sync completed', {
        description: `Successfully synced ${data.synced || 0} listings${
          data.archived > 0 ? ` and archived ${data.archived} obsolete listings` : ''
        }`
      });
      
      // Refetch monitor data to show updated stats
      refetchMonitor();
      
    } catch (error) {
      console.error('Error syncing listings:', error);
      
      // Determine if it's an auth error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                         errorMessage.toLowerCase().includes('token') ||
                         errorMessage.toLowerCase().includes('credentials') ||
                         errorMessage.toLowerCase().includes('unauthorized');
      
      // Set appropriate error message
      setSyncError(
        isAuthError 
          ? 'Authentication failed. Check Guesty API credentials in environment variables.' 
          : `Failed to sync with Guesty API: ${errorMessage}`
      );
      
      // Set up retry countdown
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
      
      // Show toast notification
      toast.error('Failed to sync listings', {
        description: isAuthError 
          ? 'Authentication failed. Check Guesty API credentials.'
          : errorMessage
      });
    } finally {
      setIsSyncing(false);
    }
  }, [refetchMonitor]);

  // Helper to send mock test webhook
  const handleSendTestWebhook = useCallback(async () => {
    setIsSendingTestWebhook(true);
    // Sample test payload
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
      // Call the Edge Function: guesty-reservation-webhook (public endpoint via Supabase Functions)
      const { data, error } = await supabase.functions.invoke('guesty-reservation-webhook', {
        method: 'POST',
        body: testPayload,
        headers: {
          // This endpoint requires authorization; in prod set the right secret!
          // For TEST: send a secret matching GUESTY_WEBHOOK_SECRET (if required)
          // If you're using auth in local .env, add: authorization: `Bearer ${import.meta.env.VITE_GUESTY_WEBHOOK_SECRET}`
        }
      });

      if (error) throw new Error(error.message || "Error sending webhook");

      if (!data?.success) {
        throw new Error(data?.error || "Test webhook not successful");
      }

      toast.success("Webhook sent successfully (test)", {
        description: "The mock reservation webhook was sent and logged.",
      });

      // Optionally refetch monitoring panel/logs if you want
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

      {/* Error display */}
      {syncError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sync Failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{syncError}</p>
            {retryCountdown !== null && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto mt-2" 
                onClick={handleSync}
              >
                Retry Now {retryCountdown > 0 ? `(${retryCountdown}s)` : ''}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

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
    </div>
  );
};

export default GuestyIntegration;
