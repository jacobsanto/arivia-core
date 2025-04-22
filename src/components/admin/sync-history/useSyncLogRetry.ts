
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RetrySyncOptions } from "./syncLog.types";
import { setRetryingFlag } from "./syncLog.state";

// Handles retrying logic and returns the retrySync function and loading state
export function useSyncLogRetry() {
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  async function retrySync({ logId, service, syncType }: RetrySyncOptions, refetch?: () => Promise<void>) {
    try {
      setIsRetrying(prev => setRetryingFlag(prev, logId, true));
      const functionName = service?.toLowerCase() === 'guesty' ? 'guesty-sync' : 'sync-service';
      const { error: fnError } = await supabase.functions.invoke(functionName, {
        body: { sync_type: syncType, retry_from_log_id: logId }
      });
      if (fnError) throw new Error(fnError.message);
      toast({
        title: "Sync Retry Initiated",
        description: `${service} sync has been triggered. Check logs for updates.`,
      });
      if (refetch) await refetch(); // Optional refetch after retry
    } catch (e: any) {
      toast({
        title: "Sync Retry Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(prev => setRetryingFlag(prev, logId, false));
    }
  }

  return { retrySync, isRetrying };
}
