
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PermissionManagement from "./permission-management/PermissionManagement";
import UserRolesList from "./role-management/UserRolesList";
import UnauthorizedAccess from "./role-management/UnauthorizedAccess";
import UserDeleteDialog from "./role-management/UserDeleteDialog";
import DeleteAllUsersDialog from "./role-management/DeleteAllUsersDialog";
import RolePermissionCRUD from "./role-permission-crud/RolePermissionCRUD";
import { useRoleManagement } from "./role-management/useRoleManagement";
import { profileToUser } from "@/types/auth/base";
import type { UserProfile } from "@/contexts/UserContext";

// Main component for Role Management
const RoleManagement: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  
  const {
    users,
    isLoading,
    currentUser,
    userToDelete,
    setUserToDelete,
    isDeleting,
    isDeletingAll,
    handleDeleteConfirm,
    deleteAllUsers,
    handleEditPermissions
  } = useRoleManagement();

  // Only superadmins can access this component
  if (user?.role !== "superadmin") {
    return <UnauthorizedAccess />;
  }

  // Helper function to convert UserProfile to User with proper role casting using the utility function
  const convertToUser = (userProfile: UserProfile): User => {
    return profileToUser(userProfile);
  };
  
  return (
    <Card>
      <CardHeader className="mx-[11px] px-[3px]">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User & Permission Management
          </CardTitle>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteAllDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Users
          </Button>
        </div>
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
            <TabsTrigger value="role-crud" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Role & Permission CRUD
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="mt-4">
            <UserRolesList 
              users={users}
              isLoading={isLoading}
              currentUser={user}
              onEditPermissions={(userProfile) => {
                const convertedUser = convertToUser(userProfile);
                setSelectedUser(convertedUser);
                setActiveTab("permissions");
                return convertedUser;
              }}
              onDeleteClick={setUserToDelete}
              setActiveTab={setActiveTab}
              setSelectedUser={(userProfile) => setSelectedUser(convertToUser(userProfile))}
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

          <TabsContent value="role-crud" className="mt-4">
            <RolePermissionCRUD />
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
      
      {/* Delete All Users Confirmation Dialog */}
      <DeleteAllUsersDialog
        isOpen={isDeleteAllDialogOpen}
        isDeleting={isDeletingAll}
        userCount={users.filter(u => u.id !== user?.id).length}
        onCancel={() => setIsDeleteAllDialogOpen(false)}
        onConfirm={deleteAllUsers}
      />
    </Card>
  );
};

export default RoleManagement;
