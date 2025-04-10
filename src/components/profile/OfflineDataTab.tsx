
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { offlineManager } from "@/utils/offlineManager";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const OfflineDataTab = () => {
  const { toast } = useToast();
  const [syncingData, setSyncingData] = useState(false);
  const offlineData = offlineManager.getOfflineDataSummary();
  const totalOfflineItems = offlineData.total;
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offline Data</CardTitle>
        <CardDescription>Manage data stored on this device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-2xl font-bold">{totalOfflineItems}</div>
            <div className="text-sm text-muted-foreground">Pending Changes</div>
          </div>
          {Object.entries(offlineData.summary || {}).map(([type, count]) => (
            <div key={type} className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{type}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            onClick={handleSyncData}
            disabled={totalOfflineItems === 0 || syncingData}
          >
            {syncingData ? "Syncing..." : "Sync Now"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearOfflineData}
            disabled={totalOfflineItems === 0}
          >
            Clear Offline Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineDataTab;
