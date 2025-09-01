import { useState, useEffect } from 'react';
import { SystemPermission, CreatePermissionData, UpdatePermissionData, PermissionCategory } from '@/types/permissions.types';
import { permissionsService } from '@/services/permissions.service';
import { toast } from 'sonner';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionsService.getAllPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (permissionData: CreatePermissionData) => {
    try {
      const newPermission = await permissionsService.createPermission(permissionData);
      setPermissions(prev => [...prev, newPermission]);
      toast.success('Permission created successfully');
      return newPermission;
    } catch (err: any) {
      toast.error('Failed to create permission');
      throw err;
    }
  };

  const updatePermission = async (id: string, updates: UpdatePermissionData) => {
    try {
      const updatedPermission = await permissionsService.updatePermission(id, updates);
      setPermissions(prev => 
        prev.map(permission => 
          permission.id === id ? updatedPermission : permission
        )
      );
      toast.success('Permission updated successfully');
      return updatedPermission;
    } catch (err: any) {
      toast.error('Failed to update permission');
      throw err;
    }
  };

  const deletePermission = async (id: string) => {
    try {
      await permissionsService.deletePermission(id);
      setPermissions(prev => 
        prev.map(permission => 
          permission.id === id ? { ...permission, is_active: false } : permission
        )
      );
      toast.success('Permission deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete permission');
      throw err;
    }
  };

  const getPermissionsByCategory = (category: PermissionCategory) => {
    return permissions.filter(permission => 
      permission.category === category && permission.is_active
    );
  };

  // Backward compatibility functions
  const canAccess = (permissionKey: string) => {
    // For now, allow all access since user wants permissions page for everyone
    return true;
  };

  const getOfflineCapabilities = () => {
    // Return basic offline capabilities
    return ['read', 'cache'];
  };

  const getAllPermissionsList = () => {
    return permissions.filter(p => p.is_active).map(p => p.permission_key);
  };

  const getPermissionStats = () => {
    const total = permissions.length;
    const active = permissions.filter(p => p.is_active).length;
    const byCategory = permissions.reduce((acc, permission) => {
      if (permission.is_active) {
        acc[permission.category] = (acc[permission.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, active, byCategory };
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionsByCategory,
    getPermissionStats,
    // Backward compatibility functions
    canAccess,
    getOfflineCapabilities,
    getAllPermissionsList
  };
};