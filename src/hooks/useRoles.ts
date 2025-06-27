
import { useState, useEffect } from 'react';
import { Role, CreateRoleData, UpdateRoleData, RoleWithPermissions } from '@/types/role-permission';
import { RoleService } from '@/services/role-permission/role.service';
import { toast } from 'sonner';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RoleService.getRoles();
      setRoles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData) => {
    try {
      const newRole = await RoleService.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      toast.success('Role created successfully');
      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateRole = async (id: string, updates: UpdateRoleData) => {
    try {
      const updatedRole = await RoleService.updateRole(id, updates);
      setRoles(prev => prev.map(role => role.id === id ? updatedRole : role));
      toast.success('Role updated successfully');
      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await RoleService.deleteRole(id);
      setRoles(prev => prev.filter(role => role.id !== id));
      toast.success('Role deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
      toast.error(errorMessage);
      throw err;
    }
  };

  const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
    try {
      await RoleService.assignPermissionsToRole(roleId, permissionIds);
      toast.success('Permissions assigned successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign permissions';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getRoleWithPermissions = async (id: string): Promise<RoleWithPermissions | null> => {
    try {
      return await RoleService.getRoleWithPermissions(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch role permissions';
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    getRoleWithPermissions,
    refetch: fetchRoles
  };
};
