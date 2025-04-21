
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { SwipeableTabsProvider } from "@/components/ui/tabs";
import { LucideProps } from "lucide-react";

// Define proper type for icon names
type IconName = keyof typeof LucideIcons;

interface SwipeableTabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: IconName;
    disabled?: boolean;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  value,
  onValueChange,
  className,
}) => {
  return (
    <SwipeableTabsProvider>
      <div className={cn("w-full", className)}>
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start md:justify-center px-2 py-1">
          {tabs.map((tab) => {
            let iconElement = null;
            if (tab.icon && typeof tab.icon === "string") {
              // Check if the icon exists in Lucide icons
              const LucideIcon = LucideIcons[tab.icon as IconName];
              // Only render if it's a valid component
              if (LucideIcon && typeof LucideIcon === 'function') {
                iconElement = <LucideIcon className="h-4 w-4" />;
              }
            }
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                onClick={() => onValueChange(tab.value)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5"
                data-state={value === tab.value ? "active" : undefined}
              >
                {iconElement}
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </SwipeableTabsProvider>
  );
};

export default SwipeableTabs;
