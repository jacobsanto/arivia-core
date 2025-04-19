
import React, { useRef, useEffect } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Users, Mail, Wrench, Plug, Shield, PaintBucket, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsTabListProps {
  activeTab: string;
}

const SettingsTabList: React.FC<SettingsTabListProps> = ({ activeTab }) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabElementRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobile();
  
  // Scroll active tab into view when the active tab changes
  useEffect(() => {
    if (isMobile && tabsRef.current) {
      // Use a small delay to ensure the DOM is updated
      const timer = setTimeout(() => {
        const activeTabElement = tabsRef.current?.querySelector(`[data-state="active"]`) as HTMLButtonElement;
        
        if (activeTabElement) {
          activeTabElementRef.current = activeTabElement;
          // Calculate the scroll amount to center the tab
          const container = tabsRef.current;
          const scrollLeft = activeTabElement.offsetLeft - (container.clientWidth / 2) + (activeTabElement.offsetWidth / 2);
          
          // Smooth scroll to position
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, isMobile]);

  return (
    <div className="overflow-hidden">
      <ScrollArea orientation="horizontal" className="w-full pb-2">
        <TabsList 
          className="inline-flex w-full md:grid md:grid-cols-4 lg:grid-cols-8 md:w-full"
          ref={tabsRef}
        >
          <TabsTrigger value="general" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-2 min-w-[100px] md:min-w-0">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </span>
          </TabsTrigger>
        </TabsList>
      </ScrollArea>
    </div>
  );
};

export default SettingsTabList;
