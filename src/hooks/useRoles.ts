
import { useState, useEffect } from 'react';
import { Role, RoleWithPermissions, CreateRoleData, UpdateRoleData } from '@/types/role-permission';
import { RoleService } from '@/services/role-permission/role.service';
import { toast } from 'sonner';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await RoleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData): Promise<Role> => {
    try {
      const newRole = await RoleService.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      toast.success('Role created successfully');
      return newRole;
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
      throw error;
    }
  };

  const updateRole = async (id: string, updates: UpdateRoleData): Promise<Role> => {
    try {
      const updatedRole = await RoleService.updateRole(id, updates);
      setRoles(prev => prev.map(role => role.id === id ? updatedRole : role));
      toast.success('Role updated successfully');
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
      throw error;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await RoleService.deleteRole(id);
      setRoles(prev => prev.filter(role => role.id !== id));
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
      throw error;
    }
  };

  const getRoleWithPermissions = async (id: string): Promise<RoleWithPermissions | null> => {
    try {
      return await RoleService.getRoleWithPermissions(id);
    } catch (error) {
      console.error('Error fetching role with permissions:', error);
      return null;
    }
  };

  const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
    try {
      await RoleService.assignPermissionsToRole(roleId, permissionIds);
      toast.success('Permissions assigned successfully');
    } catch (error) {
      console.error('Error assigning permissions:', error);
      toast.error('Failed to assign permissions');
      throw error;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    getRoleWithPermissions,
    assignPermissionsToRole,
    refetch: fetchRoles
  };
};
