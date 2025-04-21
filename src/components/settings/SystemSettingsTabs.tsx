
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SwipeableTabs from "@/components/ui/swipeable-tabs";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import NotificationSettings from "./sections/NotificationSettings";
import IntegrationSettings from "./sections/integration/IntegrationSettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import SettingsTabContent from "./tabs/SettingsTabContent";
import { Settings, Users, Bell, Plug, Palette } from "lucide-react";

const settingsTabs = [
  { value: "general", label: "General", icon: "Settings" as const },
  { value: "users", label: "Users", icon: "Users" as const },
  { value: "notifications", label: "Notifications", icon: "Bell" as const },
  { value: "integrations", label: "Integrations", icon: "Plug" as const },
  { value: "appearance", label: "Appearance", icon: "Palette" as const },
];

const SystemSettingsTabs = () => {
  const [value, setValue] = useState("general");

  return (
    <Tabs value={value} onValueChange={setValue} className="w-full">
      <div className="mb-8">
        <SwipeableTabs
          tabs={settingsTabs}
          value={value}
          onValueChange={setValue}
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
