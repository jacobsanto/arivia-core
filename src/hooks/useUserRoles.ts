
import { useState, useEffect } from 'react';
import { UserWithRoles } from '@/types/role-permission';
import { UserRoleService } from '@/services/role-permission/user-role.service';
import { toast } from 'sonner';

export const useUserRoles = () => {
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsersWithRoles = async () => {
    try {
      setIsLoading(true);
      const data = await UserRoleService.getUsersWithRoles();
      setUsersWithRoles(data);
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      toast.error('Failed to fetch users with roles');
    } finally {
      setIsLoading(false);
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string, tenantId: string) => {
    try {
      await UserRoleService.assignRoleToUser(userId, roleId, tenantId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Role assigned successfully');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      throw error;
    }
  };

  const revokeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      await UserRoleService.revokeRoleFromUser(userId, roleId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Role revoked successfully');
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error('Failed to revoke role');
      throw error;
    }
  };

  const assignMultipleRolesToUser = async (userId: string, roleIds: string[], tenantId: string) => {
    try {
      await UserRoleService.assignMultipleRolesToUser(userId, roleIds, tenantId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Roles assigned successfully');
    } catch (error) {
      console.error('Error assigning multiple roles:', error);
      toast.error('Failed to assign roles');
      throw error;
    }
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  return {
    usersWithRoles,
    isLoading,
    assignRoleToUser,
    revokeRoleFromUser,
    assignMultipleRolesToUser,
    refetch: fetchUsersWithRoles
  };
};
