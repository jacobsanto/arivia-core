
import { useState, useEffect } from 'react';
import { UserWithRoles } from '@/types/role-permission';
import { UserRoleService } from '@/services/role-permission/user-role.service';
import { toast } from 'sonner';

export const useUserRoles = () => {
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersWithRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await UserRoleService.getUsersWithRoles();
      setUsersWithRoles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users with roles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string, tenantId: string) => {
    try {
      await UserRoleService.assignRoleToUser(userId, roleId, tenantId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Role assigned to user successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role to user';
      toast.error(errorMessage);
      throw err;
    }
  };

  const revokeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      await UserRoleService.revokeRoleFromUser(userId, roleId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Role revoked from user successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke role from user';
      toast.error(errorMessage);
      throw err;
    }
  };

  const assignMultipleRolesToUser = async (userId: string, roleIds: string[], tenantId: string) => {
    try {
      await UserRoleService.assignMultipleRolesToUser(userId, roleIds, tenantId);
      await fetchUsersWithRoles(); // Refresh data
      toast.success('Roles assigned to user successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign roles to user';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  return {
    usersWithRoles,
    isLoading,
    error,
    assignRoleToUser,
    revokeRoleFromUser,
    assignMultipleRolesToUser,
    refetch: fetchUsersWithRoles
  };
};
