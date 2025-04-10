
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PermissionManagement from "./permission-management/PermissionManagement";
import UserRolesList from "./role-management/UserRolesList";
import UnauthorizedAccess from "./role-management/UnauthorizedAccess";
import UserDeleteDialog from "./role-management/UserDeleteDialog";
import { useRoleManagement } from "./role-management/useRoleManagement";

// Main component for Role Management
const RoleManagement: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const {
    users,
    userToDelete,
    setUserToDelete,
    isDeleting,
    handleDeleteConfirm,
    handleEditPermissions
  } = useRoleManagement();

  // Only superadmins can access this component
  if (user?.role !== "superadmin") {
    return <UnauthorizedAccess />;
  }
  
  return (
    <Card>
      <CardHeader className="mx-[11px] px-[3px]">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User & Permission Management
        </CardTitle>
        <CardDescription>
          Manage user roles and specific permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="mt-4">
            <UserRolesList 
              users={users}
              currentUser={user}
              onEditPermissions={handleEditPermissions}
              onDeleteClick={setUserToDelete}
              setActiveTab={setActiveTab}
              setSelectedUser={setSelectedUser}
            />
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-4">
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Permissions for {selectedUser.name}
                  </h3>
                  <button
                    className="px-3 py-1 text-sm border rounded-md"
                    onClick={() => setActiveTab("roles")}
                  >
                    Back to Users
                  </button>
                </div>
                <PermissionManagement selectedUser={selectedUser} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Select a user from the Role Management tab to edit their permissions
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* User Deletion Confirmation Dialog */}
      <UserDeleteDialog
        userToDelete={userToDelete}
        isDeleting={isDeleting}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
};

export default RoleManagement;
