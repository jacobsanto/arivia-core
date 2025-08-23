
import React, { useEffect, useRef } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { SwipeableTabsProvider } from "@/components/ui/tabs";
import { LucideIcon, LucideProps } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = tabRefs.current[value];
    const container = scrollRef.current;
    if (el && container) {
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const containerWidth = container.clientWidth;
      const targetScrollLeft = elLeft - Math.max(0, (containerWidth - elWidth) / 2);
      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  }, [value]);

  return (
    <SwipeableTabsProvider>
      <div className={cn("w-full min-w-0", className)}>
        <div ref={scrollRef} className="w-full min-w-0 overflow-x-auto">
          <TabsList className="inline-flex min-w-max flex-nowrap px-2 py-1 justify-start md:justify-center">
            {tabs.map((tab) => {
              let iconElement = null;
              if (tab.icon) {
                const IconComponent = LucideIcons[tab.icon] as React.ComponentType<LucideProps>;
                if (IconComponent) {
                  iconElement = <IconComponent className="h-4 w-4" />;
                }
              }
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.disabled}
                  onClick={() => onValueChange(tab.value)}
                  ref={(el) => { tabRefs.current[tab.value] = el; }}
                  className="shrink-0 flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5"
                  data-state={value === tab.value ? "active" : undefined}
                >
                  {iconElement}
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
    </SwipeableTabsProvider>
  );
};

export default SwipeableTabs;
