
import { useState, useEffect } from 'react';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types/role-permission';
import { PermissionService } from '@/services/role-permission/permission.service';
import { toast } from 'sonner';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await PermissionService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const createPermission = async (permissionData: CreatePermissionData): Promise<Permission> => {
    try {
      const newPermission = await PermissionService.createPermission(permissionData);
      setPermissions(prev => [...prev, newPermission]);
      toast.success('Permission created successfully');
      return newPermission;
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Failed to create permission');
      throw error;
    }
  };

  const updatePermission = async (id: string, updates: UpdatePermissionData): Promise<Permission> => {
    try {
      const updatedPermission = await PermissionService.updatePermission(id, updates);
      setPermissions(prev => prev.map(perm => perm.id === id ? updatedPermission : perm));
      toast.success('Permission updated successfully');
      return updatedPermission;
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
      throw error;
    }
  };

  const deletePermission = async (id: string) => {
    try {
      await PermissionService.deletePermission(id);
      setPermissions(prev => prev.filter(perm => perm.id !== id));
      toast.success('Permission deleted successfully');
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Failed to delete permission');
      throw error;
    }
  };

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const category = permission.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    permissionsByCategory,
    isLoading,
    createPermission,
    updatePermission,
    deletePermission,
    refetch: fetchPermissions
  };
};
