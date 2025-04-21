
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SwipeableTabs from "@/components/ui/swipeable-tabs";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import NotificationSettings from "./sections/NotificationSettings";
import IntegrationSettings from "./sections/integration/IntegrationSettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import SettingsTabContent from "./tabs/SettingsTabContent";

const SystemSettingsTabs = () => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <div className="mb-8">
        <SwipeableTabs
          tabs={[
            { value: 'general', label: 'General', icon: 'Settings' },
            { value: 'users', label: 'Users', icon: 'Users' },
            { value: 'notifications', label: 'Notifications', icon: 'Bell' },
            { value: 'integrations', label: 'Integrations', icon: 'Plug' },
            { value: 'appearance', label: 'Appearance', icon: 'Palette' },
          ]}
        />
      </div>

      <SettingsTabContent
        value="general"
        title="General Settings"
        status={{ status: "configured", lastUpdated: new Date() }}
      >
        <GeneralSettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="users"
        title="User Management"
        status={{ status: "configured" }}
      >
        <UserManagementSettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="notifications"
        title="Notification Settings"
        status={{ status: "not-configured" }}
      >
        <NotificationSettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="integrations"
        title="Integration Settings"
        status={{ status: "not-configured" }}
      >
        <IntegrationSettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="appearance"
        title="Appearance Settings"
        status={{ status: "configured" }}
      >
        <AppearanceSettings />
      </SettingsTabContent>
    </Tabs>
  );
};

export default SystemSettingsTabs;
