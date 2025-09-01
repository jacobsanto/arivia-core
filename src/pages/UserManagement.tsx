import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserFiltersComponent from '@/components/user-management/UserFilters';
import UserList from '@/components/user-management/UserList';
import ManageUserModal from '@/components/user-management/ManageUserModal';
import { StaffMember } from '@/types/userManagement.types';

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    saving,
    error,
    filters,
    updateFilters,
    createUser,
    updateUser,
    deleteUser
  } = useUserManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | undefined>();

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: StaffMember) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>User Management - Arivia Villa Sync</title>
        </Helmet>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Users</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>User Management - Arivia Villa Sync</title>
        <meta name="description" content="Manage staff members, roles, and access control for your villa operations" />
      </Helmet>

      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage staff members, assign roles, and control access to the system. 
                Changes to user roles take effect immediately.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddUser} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isOnline).length}
              </div>
              <div className="text-sm text-muted-foreground">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {users.reduce((sum, u) => sum + u.openTasksCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Open Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <UserFiltersComponent 
            filters={filters} 
            onFiltersChange={updateFilters} 
          />
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            All system users with their current roles and status. Click edit to modify user details or delete to remove access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList
            users={users}
            loading={loading}
            onEditUser={handleEditUser}
            onDeleteUser={deleteUser}
          />
        </CardContent>
      </Card>

      {/* Manage User Modal */}
      <ManageUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        onUpdate={updateUser}
        user={editingUser}
        isLoading={saving}
      />

      {/* Guidelines */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">User Management Guidelines</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Role Assignment</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Assign the least privileged role necessary</li>
                <li>• Super Admin and Administrator roles have full access</li>
                <li>• Property Managers can oversee operations</li>
                <li>• Staff roles have task-specific permissions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Regularly review user roles and permissions</li>
                <li>• Remove inactive users promptly</li>
                <li>• Keep contact information updated</li>
                <li>• Monitor task assignments and workload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;