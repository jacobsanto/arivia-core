
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  Mail, 
  Wrench, 
  Plug, 
  Shield, 
  PaintBucket,
  Bell
} from "lucide-react";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import EmailSettings from "./sections/EmailSettings";
import MaintenanceSettings from "./sections/MaintenanceSettings";
import IntegrationSettings from "./sections/IntegrationSettings";
import SecuritySettings from "./sections/SecuritySettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import NotificationSettings from "./sections/NotificationSettings";
import SettingsSectionBadge from "./SettingsSectionBadge";

const SystemSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  // In a real app, this data would come from API or context
  const settingsStatus = {
    general: {
      status: "configured" as const,
      lastUpdated: new Date(2025, 2, 30, 14, 25)
    },
    users: { 
      status: "configured" as const, 
      lastUpdated: new Date(2025, 3, 2, 9, 45) 
    },
    email: { 
      status: "needs-attention" as const, 
      lastUpdated: new Date(2025, 3, 10, 11, 20) 
    },
    maintenance: { 
      status: "configured" as const,
      lastUpdated: new Date(2025, 3, 11, 15, 10) 
    },
    integrations: { 
      status: "not-configured" as const 
    },
    security: { 
      status: "configured" as const,
      lastUpdated: new Date(2025, 3, 5, 10, 30) 
    },
    appearance: { 
      status: "configured" as const,
      lastUpdated: new Date(2025, 3, 1, 16, 45) 
    },
    notifications: { 
      status: "configured" as const,
      lastUpdated: new Date(2025, 3, 9, 14, 15) 
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="overflow-auto">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="general" className="flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Usr</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
            <span className="sm:hidden">Mail</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center justify-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Maintenance</span>
            <span className="sm:hidden">Maint</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center justify-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
            <span className="sm:hidden">Int</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden">Sec</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
            <span className="sm:hidden">App</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notif</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">General Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.general.status} 
            lastUpdated={settingsStatus.general.lastUpdated} 
          />
        </div>
        <GeneralSettings />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">User Management</h2>
          <SettingsSectionBadge 
            status={settingsStatus.users.status} 
            lastUpdated={settingsStatus.users.lastUpdated} 
          />
        </div>
        <UserManagementSettings />
      </TabsContent>
      
      <TabsContent value="email" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Email Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.email.status} 
            lastUpdated={settingsStatus.email.lastUpdated} 
          />
        </div>
        <EmailSettings />
      </TabsContent>
      
      <TabsContent value="maintenance" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Maintenance Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.maintenance.status} 
            lastUpdated={settingsStatus.maintenance.lastUpdated} 
          />
        </div>
        <MaintenanceSettings />
      </TabsContent>
      
      <TabsContent value="integrations" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Integration Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.integrations.status} 
            lastUpdated={settingsStatus.integrations.lastUpdated} 
          />
        </div>
        <IntegrationSettings />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.security.status} 
            lastUpdated={settingsStatus.security.lastUpdated} 
          />
        </div>
        <SecuritySettings />
      </TabsContent>
      
      <TabsContent value="appearance" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Appearance Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.appearance.status} 
            lastUpdated={settingsStatus.appearance.lastUpdated} 
          />
        </div>
        <AppearanceSettings />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <SettingsSectionBadge 
            status={settingsStatus.notifications.status} 
            lastUpdated={settingsStatus.notifications.lastUpdated} 
          />
        </div>
        <NotificationSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SystemSettingsTabs;
