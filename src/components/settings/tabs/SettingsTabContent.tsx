import React, { useEffect } from "react";
import { TabsContent, useRegisterTab } from "@/components/ui/tabs";
import SettingsStatusBadge from "../SettingsStatusBadge";
interface SettingsTabContentProps {
  value: string;
  title: string;
  status: {
    status: "configured" | "not-configured" | "needs-attention";
    lastUpdated?: Date;
  };
  children: React.ReactNode;
}
const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
  value,
  title,
  status,
  children
}) => {
  // Register this tab with the swipeable tabs provider
  useRegisterTab(value);
  return <TabsContent value={value} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        
        <SettingsStatusBadge status={status.status} lastUpdated={status.lastUpdated} />
      </div>
      {children}
    </TabsContent>;
};
export default SettingsTabContent;