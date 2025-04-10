
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OfflineDataSummary from "./offline/OfflineDataSummary";
import OfflineDataActions from "./offline/OfflineDataActions";
import { useOfflineData } from "@/hooks/useOfflineData";

const OfflineDataTab = () => {
  const { offlineData, syncingData, handleSyncData, handleClearOfflineData } = useOfflineData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offline Data</CardTitle>
        <CardDescription>Manage data stored on this device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OfflineDataSummary offlineData={offlineData} />
        <Separator />
        <OfflineDataActions 
          totalOfflineItems={offlineData.total}
          syncingData={syncingData}
          onSyncData={handleSyncData}
          onClearOfflineData={handleClearOfflineData}
        />
      </CardContent>
    </Card>
  );
};

export default OfflineDataTab;
