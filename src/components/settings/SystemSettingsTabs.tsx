
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, SwipeableTabsProvider } from "@/components/ui/tabs";
import { Settings, Users, Mail, Wrench, Plug, Shield, PaintBucket, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingsStatusBadge from "./SettingsStatusBadge";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import EmailSettings from "./sections/EmailSettings";
import MaintenanceSettings from "./sections/MaintenanceSettings";
import IntegrationSettings from "./sections/IntegrationSettings";
import SecuritySettings from "./sections/SecuritySettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import NotificationSettings from "./sections/NotificationSettings";
import { settingsService, SettingsCategory } from "@/services/settings/settings.service";
import { useIsMobile } from "@/hooks/use-mobile";

type SettingsSectionStatus = {
  status: "configured" | "not-configured" | "needs-attention";
  lastUpdated?: Date;
};

type SettingsStatusMap = {
  [key: string]: SettingsSectionStatus;
};

const SystemSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const tabsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatusMap>({
    general: { status: "not-configured" },
    users: { status: "not-configured" },
    email: { status: "not-configured" },
    maintenance: { status: "not-configured" },
    integrations: { status: "not-configured" },
    security: { status: "not-configured" },
    appearance: { status: "not-configured" },
    notifications: { status: "not-configured" }
  });

  // Load settings status on component mount
  useEffect(() => {
    const loadSettingsStatus = async () => {
      const categories = [
        { key: 'general', category: 'general' as SettingsCategory },
        { key: 'users', category: 'user-management' as SettingsCategory },
        { key: 'email', category: 'email' as SettingsCategory },
        { key: 'maintenance', category: 'maintenance' as SettingsCategory },
        { key: 'integrations', category: 'integration' as SettingsCategory },
        { key: 'security', category: 'security' as SettingsCategory },
        { key: 'appearance', category: 'appearance' as SettingsCategory },
        { key: 'notifications', category: 'notifications' as SettingsCategory }
      ];

      const newStatus: SettingsStatusMap = { ...settingsStatus };
      
      // Load status for each settings category
      for (const { key, category } of categories) {
        try {
          const data = await settingsService.getSettings(category);
          
          // If we have data, the category is configured
          if (data && Object.keys(data).length > 0) {
            newStatus[key] = {
              status: 'configured',
              lastUpdated: new Date()
            };
          }
        } catch (error) {
          console.error(`Error loading ${category} settings status:`, error);
        }
      }
      
      setSettingsStatus(newStatus);
    };

    loadSettingsStatus();
  }, []);

  // Scroll the active tab into view when it changes
  useEffect(() => {
    if (isMobile && tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-state="active"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab, isMobile]);

  return (
    <SwipeableTabsProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

        <ScrollArea className="w-full">
          <TabsContent value="general" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">General Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.general.status} 
                lastUpdated={settingsStatus.general.lastUpdated} 
              />
            </div>
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">User Management</h2>
              <SettingsStatusBadge 
                status={settingsStatus.users.status} 
                lastUpdated={settingsStatus.users.lastUpdated}
              />
            </div>
            <UserManagementSettings />
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Email Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.email.status} 
                lastUpdated={settingsStatus.email.lastUpdated}
              />
            </div>
            <EmailSettings />
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Maintenance Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.maintenance.status} 
                lastUpdated={settingsStatus.maintenance.lastUpdated}
              />
            </div>
            <MaintenanceSettings />
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Integration Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.integrations.status} 
                lastUpdated={settingsStatus.integrations.lastUpdated}
              />
            </div>
            <IntegrationSettings />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.security.status} 
                lastUpdated={settingsStatus.security.lastUpdated}
              />
            </div>
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Appearance Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.appearance.status} 
                lastUpdated={settingsStatus.appearance.lastUpdated}
              />
            </div>
            <AppearanceSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Notification Settings</h2>
              <SettingsStatusBadge 
                status={settingsStatus.notifications.status} 
                lastUpdated={settingsStatus.notifications.lastUpdated}
              />
            </div>
            <NotificationSettings />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </SwipeableTabsProvider>
  );
};

export default SystemSettingsTabs;
