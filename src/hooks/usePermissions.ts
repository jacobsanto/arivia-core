
import { useState, useEffect } from 'react';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types/role-permission';
import { PermissionService } from '@/services/role-permission/permission.service';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

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

  // Enhanced RBAC methods
  const canAccess = (permissionKey: string): boolean => {
    if (!user) return false;
    
    // Check custom permissions first
    if (user.custom_permissions && user.custom_permissions[permissionKey]) {
      return true;
    }
    
    // Fallback to role-based permissions for now
    const rolePermissions: Record<string, string[]> = {
      'superadmin': ['*'], // All permissions
      'tenant_admin': [
        'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
        'assignTasks', 'viewInventory', 'manageInventory', 'viewUsers', 
        'manageUsers', 'viewReports', 'viewChat', 'view_damage_reports'
      ],
      'property_manager': [
        'viewDashboard', 'viewProperties', 'viewAllTasks', 'assignTasks', 
        'viewInventory', 'viewReports', 'viewChat'
      ],
      'housekeeping_staff': [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
      ],
      'maintenance_staff': [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
      ],
      'inventory_manager': [
        'viewDashboard', 'viewInventory', 'manageInventory', 'approveTransfers', 
        'viewReports', 'viewChat'
      ],
      'concierge': [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewChat'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permissionKey);
  };

  const getAllPermissionsList = (): string[] => {
    return permissions.map(p => p.key);
  };

  const getOfflineCapabilities = (): string[] => {
    return permissions.filter(p => p.offline_capable).map(p => p.title);
  };

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
    refetch: fetchPermissions,
    // Enhanced RBAC methods
    canAccess,
    getOfflineCapabilities,
    getAllPermissionsList
  };
};
