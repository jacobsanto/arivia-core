
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { offlineManager } from "@/utils/offlineManager";
import { OfflineDataSummary } from "@/types/offline";

export const useOfflineData = () => {
  const { toast } = useToast();
  const [syncingData, setSyncingData] = useState(false);
  const offlineData = offlineManager.getOfflineDataSummary() as OfflineDataSummary;
  
  const handleSyncData = async () => {
    setSyncingData(true);
    try {
      await offlineManager.syncOfflineData();
      toast({
        title: "Data synchronized",
        description: "All your offline changes have been uploaded"
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setSyncingData(false);
    }
  };

  const handleClearOfflineData = () => {
    try {
      localStorage.removeItem(offlineManager["STORAGE_KEY"]);
      toast({
        title: "Offline data cleared",
        description: "All cached data has been removed from your device"
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not clear offline data",
        variant: "destructive"
      });
    }
  };
  
  return {
    offlineData,
    syncingData,
    handleSyncData,
    handleClearOfflineData
  };
};
