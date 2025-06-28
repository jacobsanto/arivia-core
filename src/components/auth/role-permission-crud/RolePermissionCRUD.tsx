
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key } from "lucide-react";
import RolesManagement from './RolesManagement';
import PermissionsManagement from './PermissionsManagement';

const RolePermissionCRUD: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("roles");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Role & Permission CRUD</h2>
        <p className="text-muted-foreground">Create, read, update, and delete roles and permissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesManagement />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RolePermissionCRUD;
