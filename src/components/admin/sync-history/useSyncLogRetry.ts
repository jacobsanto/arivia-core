
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RetrySyncOptions } from "./syncLog.types";
import { setRetryingFlag } from "./syncLog.state";

type RefetchFunction = () => Promise<unknown>;

// Handles retrying logic and returns the retrySync function and loading state
export function useSyncLogRetry() {
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Modified to return a Promise consistently
  async function retrySync(
    { logId, service, syncType }: RetrySyncOptions, 
    refetch?: RefetchFunction
  ): Promise<unknown> {
    try {
      // Update local state to show retrying status
      setIsRetrying(prev => setRetryingFlag(prev, logId, true));
      
      // Call the appropriate edge function
      const functionName = service?.toLowerCase() === 'guesty' ? 'guesty-sync' : 'sync-service';
      const { error: fnError } = await supabase.functions.invoke(functionName, {
        body: { sync_type: syncType, retry_from_log_id: logId }
      });
      
      if (fnError) throw new Error(fnError.message);
      
      // Show success toast
      toast({
        title: "Sync Retry Initiated",
        description: `${service} sync has been triggered. Check logs for updates.`,
      });
      
      // Conditionally refetch data
      if (refetch) {
        return await refetch(); // Return the promise from refetch
      }
      
      return Promise.resolve(); // Ensure we always return a Promise
    } catch (e: any) {
      // Show error toast
      toast({
        title: "Sync Retry Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(e); // Return rejected promise on error
    } finally {
      // Always reset the retrying state
      setIsRetrying(prev => setRetryingFlag(prev, logId, false));
    }
  }

  return { retrySync, isRetrying };
}
