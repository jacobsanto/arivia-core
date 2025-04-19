
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  return (
    <TabsContent value={value} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <SettingsStatusBadge 
          status={status.status} 
          lastUpdated={status.lastUpdated}
        />
      </div>
      {children}
    </TabsContent>
  );
};

export default SettingsTabContent;
