
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  Mail, 
  Wrench, 
  Plugs, 
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

const SystemSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="overflow-auto">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plugs className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general" className="space-y-4">
        <GeneralSettings />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <UserManagementSettings />
      </TabsContent>
      
      <TabsContent value="email" className="space-y-4">
        <EmailSettings />
      </TabsContent>
      
      <TabsContent value="maintenance" className="space-y-4">
        <MaintenanceSettings />
      </TabsContent>
      
      <TabsContent value="integrations" className="space-y-4">
        <IntegrationSettings />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <SecuritySettings />
      </TabsContent>
      
      <TabsContent value="appearance" className="space-y-4">
        <AppearanceSettings />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SystemSettingsTabs;
