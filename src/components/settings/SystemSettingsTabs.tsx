
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SwipeableTabs from "@/components/ui/swipeable-tabs";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import NotificationSettings from "./sections/NotificationSettings";
import IntegrationSettings from "./sections/integration/IntegrationSettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import EmailSettings from "./sections/EmailSettings";
import BackupSettings from "./sections/BackupSettings";
import EnhancedSecuritySettings from "./sections/EnhancedSecuritySettings";
import UserManagement from "../admin/UserManagement";
import SecurityMonitoring from "../admin/SecurityMonitoring";
import SettingsTabContent from "./tabs/SettingsTabContent";

const settingsTabs = [
  { value: "general", label: "General", icon: "Settings" as const },
  { value: "users", label: "Users", icon: "Users" as const },
  { value: "security", label: "Security", icon: "Shield" as const },
  { value: "monitoring", label: "Monitoring", icon: "Activity" as const },
  { value: "permissions", label: "Permissions", icon: "Key" as const },
  { value: "email", label: "Email", icon: "Mail" as const },
  { value: "notifications", label: "Notifications", icon: "Bell" as const },
  { value: "integrations", label: "Integrations", icon: "Plug" as const },
  { value: "backup", label: "Backup", icon: "Archive" as const },
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
        <UserManagement />
      </SettingsTabContent>

      <SettingsTabContent
        value="security"
        title="Security Settings"
        status={{ status: "configured" }}
      >
        <EnhancedSecuritySettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="monitoring"
        title="Security Monitoring"
        status={{ status: "configured" }}
      >
        <SecurityMonitoring />
      </SettingsTabContent>

      <SettingsTabContent
        value="permissions"
        title="System Permissions"
        status={{ status: "configured" }}
      >
        <UserManagementSettings />
      </SettingsTabContent>

      <SettingsTabContent
        value="email"
        title="Email Settings"
        status={{ status: "not-configured" }}
      >
        <EmailSettings />
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
        value="backup"
        title="Backup & Restore"
        status={{ status: "configured" }}
      >
        <BackupSettings />
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
