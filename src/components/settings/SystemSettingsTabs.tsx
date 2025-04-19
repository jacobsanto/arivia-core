
import React, { useState, useEffect } from "react";
import { Tabs, SwipeableTabsProvider } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { settingsService, SettingsCategory } from "@/services/settings/settings.service";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import EmailSettings from "./sections/EmailSettings";
import MaintenanceSettings from "./sections/MaintenanceSettings";
import IntegrationSettings from "./sections/IntegrationSettings";
import SecuritySettings from "./sections/SecuritySettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import NotificationSettings from "./sections/NotificationSettings";
import SettingsTabList from "./tabs/SettingsTabList";
import SettingsTabContent from "./tabs/SettingsTabContent";

type SettingsSectionStatus = {
  status: "configured" | "not-configured" | "needs-attention";
  lastUpdated?: Date;
};

type SettingsStatusMap = {
  [key: string]: SettingsSectionStatus;
};

const SystemSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
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
      
      for (const { key, category } of categories) {
        try {
          const data = await settingsService.getSettings(category);
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

  return (
    <SwipeableTabsProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <SettingsTabList activeTab={activeTab} />
        
        <ScrollArea className="w-full">
          <SettingsTabContent value="general" title="General Settings" status={settingsStatus.general}>
            <GeneralSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="users" title="User Management" status={settingsStatus.users}>
            <UserManagementSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="email" title="Email Settings" status={settingsStatus.email}>
            <EmailSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="maintenance" title="Maintenance Settings" status={settingsStatus.maintenance}>
            <MaintenanceSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="integrations" title="Integration Settings" status={settingsStatus.integrations}>
            <IntegrationSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="security" title="Security Settings" status={settingsStatus.security}>
            <SecuritySettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="appearance" title="Appearance Settings" status={settingsStatus.appearance}>
            <AppearanceSettings />
          </SettingsTabContent>
          
          <SettingsTabContent value="notifications" title="Notification Settings" status={settingsStatus.notifications}>
            <NotificationSettings />
          </SettingsTabContent>
        </ScrollArea>
      </Tabs>
    </SwipeableTabsProvider>
  );
};

export default SystemSettingsTabs;
