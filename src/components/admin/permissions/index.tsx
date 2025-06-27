
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { RoleList } from './RoleList';
import { RoleForm } from './RoleForm';
import { PermissionList } from './PermissionList';
import { PermissionForm } from './PermissionForm';
import { AssignRoleToUser } from './AssignRoleToUser';
import { UserRolesOverview } from './UserRolesOverview';
import { Role, Permission, UserWithRoles } from '@/types/role-permission';
import { Shield, Key, UserPlus, Users } from 'lucide-react';

type ViewState = 
  | { type: 'roles-list' }
  | { type: 'role-form'; role?: Role }
  | { type: 'permissions-list' }
  | { type: 'permission-form'; permission?: Permission }
  | { type: 'assign-roles' }
  | { type: 'user-roles-overview' }
  | { type: 'edit-user-roles'; user: UserWithRoles };

export const RolePermissionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [viewState, setViewState] = useState<ViewState>({ type: 'roles-list' });

  const resetToList = () => {
    switch (activeTab) {
      case 'roles':
        setViewState({ type: 'roles-list' });
        break;
      case 'permissions':
        setViewState({ type: 'permissions-list' });
        break;
      case 'assign':
        setViewState({ type: 'assign-roles' });
        break;
      case 'overview':
        setViewState({ type: 'user-roles-overview' });
        break;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'roles':
        setViewState({ type: 'roles-list' });
        break;
      case 'permissions':
        setViewState({ type: 'permissions-list' });
        break;
      case 'assign':
        setViewState({ type: 'assign-roles' });
        break;
      case 'overview':
        setViewState({ type: 'user-roles-overview' });
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role & Permission Management</h1>
          <p className="text-muted-foreground">
            Manage system roles, permissions, and user assignments
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Assign Roles
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Overview
          </TabsTrigger>
        </TabsList>

        <Card className="mt-6">
          <TabsContent value="roles" className="p-6">
            {viewState.type === 'roles-list' && (
              <RoleList
                onEditRole={(role) => setViewState({ type: 'role-form', role })}
                onCreateRole={() => setViewState({ type: 'role-form' })}
              />
            )}
            {viewState.type === 'role-form' && (
              <RoleForm
                role={viewState.role}
                onBack={resetToList}
                onSaved={resetToList}
              />
            )}
          </TabsContent>

          <TabsContent value="permissions" className="p-6">
            {viewState.type === 'permissions-list' && (
              <PermissionList
                onEditPermission={(permission) => setViewState({ type: 'permission-form', permission })}
                onCreatePermission={() => setViewState({ type: 'permission-form' })}
              />
            )}
            {viewState.type === 'permission-form' && (
              <PermissionForm
                permission={viewState.permission}
                onBack={resetToList}
                onSaved={resetToList}
              />
            )}
          </TabsContent>

          <TabsContent value="assign" className="p-6">
            <AssignRoleToUser onBack={resetToList} />
          </TabsContent>

          <TabsContent value="overview" className="p-6">
            {viewState.type === 'user-roles-overview' && (
              <UserRolesOverview
                onEditUserRoles={(user) => setViewState({ type: 'edit-user-roles', user })}
              />
            )}
            {viewState.type === 'edit-user-roles' && (
              <AssignRoleToUser onBack={resetToList} />
            )}
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default RolePermissionManagement;
