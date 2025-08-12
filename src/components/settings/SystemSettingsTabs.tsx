
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SwipeableTabs from "@/components/ui/swipeable-tabs";
import BackupSettings from "./sections/BackupSettings";
import UserManagement from "../admin/UserManagement";
import SecurityMonitoring from "../admin/SecurityMonitoring";
import SettingsTabContent from "./tabs/SettingsTabContent";
import EmailSettings from "./sections/email/EmailSettings";
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
        <div className="p-4 text-center text-muted-foreground">General settings coming soon</div>
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
        <div className="p-4 text-center text-muted-foreground">Security settings coming soon</div>
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
        status={{ status: "not-configured" }}
      >
        <div className="p-4 text-center text-muted-foreground">Notification settings coming soon</div>
      </SettingsTabContent>

      <SettingsTabContent
        value="integrations"
        title="Integration Settings"
        status={{ status: "not-configured" }}
      >
        <div className="p-4 text-center text-muted-foreground">Integrations coming soon</div>
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
        <div className="p-4 text-center text-muted-foreground">Appearance settings coming soon</div>
      </SettingsTabContent>
    </Tabs>
  );
};

export default SystemSettingsTabs;
