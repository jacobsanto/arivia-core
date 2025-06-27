
import { useState, useEffect } from 'react';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types/role-permission';
import { PermissionService } from '@/services/role-permission/permission.service';
import { toast } from 'sonner';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, categorized] = await Promise.all([
        PermissionService.getPermissions(),
        PermissionService.getPermissionsByCategory()
      ]);
      setPermissions(data);
      setPermissionsByCategory(categorized);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch permissions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createPermission = async (permissionData: CreatePermissionData) => {
    try {
      const newPermission = await PermissionService.createPermission(permissionData);
      setPermissions(prev => [...prev, newPermission]);
      toast.success('Permission created successfully');
      return newPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updatePermission = async (id: string, updates: UpdatePermissionData) => {
    try {
      const updatedPermission = await PermissionService.updatePermission(id, updates);
      setPermissions(prev => prev.map(permission => permission.id === id ? updatedPermission : permission));
      toast.success('Permission updated successfully');
      return updatedPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deletePermission = async (id: string) => {
    try {
      await PermissionService.deletePermission(id);
      setPermissions(prev => prev.filter(permission => permission.id !== id));
      toast.success('Permission deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    permissionsByCategory,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    refetch: fetchPermissions
  };
};
