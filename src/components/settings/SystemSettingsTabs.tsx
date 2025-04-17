
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Mail, Wrench, Plug, Shield, PaintBucket, Bell } from "lucide-react";
import GeneralSettings from "./sections/GeneralSettings";
import UserManagementSettings from "./sections/UserManagementSettings";
import EmailSettings from "./sections/EmailSettings";
import MaintenanceSettings from "./sections/MaintenanceSettings";
import IntegrationSettings from "./sections/IntegrationSettings";
import SecuritySettings from "./sections/SecuritySettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import NotificationSettings from "./sections/NotificationSettings";
import SettingsSectionBadge from "./SettingsSectionBadge";
import { settingsService } from "@/services/settings/settings.service";

const SystemSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settingsStatus, setSettingsStatus] = useState({
    general: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    users: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    email: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    maintenance: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    integrations: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    security: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    appearance: {
      status: "not-configured" as const,
      lastUpdated: undefined
    },
    notifications: {
      status: "not-configured" as const,
      lastUpdated: undefined
    }
  });

  // Load settings status on component mount
  useEffect(() => {
    const loadSettingsStatus = async () => {
      try {
        const categories = [
          { key: 'general', category: 'general' },
          { key: 'users', category: 'user-management' },
          { key: 'email', category: 'email' },
          { key: 'maintenance', category: 'maintenance' },
          { key: 'integrations', category: 'integration' },
          { key: 'security', category: 'security' },
          { key: 'appearance', category: 'appearance' },
          { key: 'notifications', category: 'notifications' }
        ];

        const newStatus = { ...settingsStatus };
        
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
      } catch (error) {
        console.error('Failed to load settings status:', error);
      }
    };

    loadSettingsStatus();
  }, []);

  return <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="overflow-auto">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="general" className="flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center justify-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center justify-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">General Settings</h2>
          <SettingsSectionBadge status={settingsStatus.general.status} lastUpdated={settingsStatus.general.lastUpdated} />
        </div>
        <GeneralSettings />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">User Management</h2>
          <SettingsSectionBadge status={settingsStatus.users.status} lastUpdated={settingsStatus.users.lastUpdated} />
        </div>
        <UserManagementSettings />
      </TabsContent>
      
      <TabsContent value="email" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Email Settings</h2>
          <SettingsSectionBadge status={settingsStatus.email.status} lastUpdated={settingsStatus.email.lastUpdated} />
        </div>
        <EmailSettings />
      </TabsContent>
      
      <TabsContent value="maintenance" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Maintenance Settings</h2>
          <SettingsSectionBadge status={settingsStatus.maintenance.status} lastUpdated={settingsStatus.maintenance.lastUpdated} />
        </div>
        <MaintenanceSettings />
      </TabsContent>
      
      <TabsContent value="integrations" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Integration Settings</h2>
          <SettingsSectionBadge status={settingsStatus.integrations.status} lastUpdated={settingsStatus.integrations.lastUpdated} />
        </div>
        <IntegrationSettings />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <SettingsSectionBadge status={settingsStatus.security.status} lastUpdated={settingsStatus.security.lastUpdated} />
        </div>
        <SecuritySettings />
      </TabsContent>
      
      <TabsContent value="appearance" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Appearance Settings</h2>
          <SettingsSectionBadge status={settingsStatus.appearance.status} lastUpdated={settingsStatus.appearance.lastUpdated} />
        </div>
        <AppearanceSettings />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <SettingsSectionBadge status={settingsStatus.notifications.status} lastUpdated={settingsStatus.notifications.lastUpdated} />
        </div>
        <NotificationSettings />
      </TabsContent>
    </Tabs>;
};
export default SystemSettingsTabs;
