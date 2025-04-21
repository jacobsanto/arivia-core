
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { SwipeableTabsProvider } from "@/components/ui/tabs";

interface SwipeableTabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: keyof typeof LucideIcons;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  defaultValue,
  className,
  onValueChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <SwipeableTabsProvider>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className={cn("w-full", className)}
      >
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start md:justify-center px-2 py-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon ? LucideIcons[tab.icon] : null;
            
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </SwipeableTabsProvider>
  );
};

export default SwipeableTabs;
