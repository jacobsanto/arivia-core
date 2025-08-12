
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SwipeableTabs from "@/components/ui/swipeable-tabs";
import BackupSettings from "./sections/BackupSettings";
import UserManagement from "../admin/UserManagement";
import SecurityMonitoring from "../admin/SecurityMonitoring";
import SettingsTabContent from "./tabs/SettingsTabContent";
import EmailSettings from "./sections/email/EmailSettings";
import SecuritySettings from "./sections/security/SecuritySettings";
import UserManagementSettings from "./sections/user-management/UserManagementSettings";
import NotificationsSettings from "./sections/notifications/NotificationsSettings";
import IntegrationsSettings from "./sections/integrations/IntegrationsSettings";
import AppearanceSettings from "./sections/appearance/AppearanceSettings";
import GeneralSettings from "./sections/general/GeneralSettings";
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
    <Tabs value={value} onValueChange={setValue} className="w-full min-w-0 max-w-[100vw] overflow-x-hidden">
      <div className="mb-4 sm:mb-8 px-2 sm:px-0 min-w-0">
        <SwipeableTabs
          tabs={settingsTabs}
          value={value}
          onValueChange={setValue}
          className="max-w-[100vw] min-w-0"
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
        <div className="space-y-6">
          <UserManagementSettings />
          <div className="overflow-x-auto">
            <UserManagement />
          </div>
        </div>
      </SettingsTabContent>
      <SettingsTabContent
        value="security"
        title="Security Settings"
        status={{ status: "configured" }}
      >
        <SecuritySettings />
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
        <div className="p-4 text-center text-muted-foreground">Permissions coming soon</div>
      </SettingsTabContent>

      <SettingsTabContent
        value="email"
        title="Email Settings"
        status={{ status: "configured" }}
      >
        <EmailSettings />
      </SettingsTabContent>
      <SettingsTabContent
        value="notifications"
        title="Notification Settings"
        status={{ status: "configured" }}
      >
        <NotificationsSettings />
      </SettingsTabContent>
      <SettingsTabContent
        value="integrations"
        title="Integration Settings"
        status={{ status: "configured" }}
      >
        <IntegrationsSettings />
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
