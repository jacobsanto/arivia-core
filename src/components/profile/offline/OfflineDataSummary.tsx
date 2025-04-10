
import React from "react";
import { OfflineDataSummary } from "@/types/offline";

interface OfflineDataSummaryProps {
  offlineData: OfflineDataSummary;
}

const OfflineDataSummary: React.FC<OfflineDataSummaryProps> = ({ offlineData }) => {
  const totalOfflineItems = offlineData.total;
  
  return (
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
  );
};

export default OfflineDataSummary;
