
import { useState, useEffect } from 'react';
import { User, FEATURE_PERMISSIONS } from '@/types/auth';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePermissionManagement = (selectedUser?: User) => {
  const { user: currentUser } = useUser();
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Get all available permissions
  const allPermissions = Object.entries(FEATURE_PERMISSIONS).map(([key, permission]) => ({
    key,
    ...permission
  }));

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  // Load user permissions
  useEffect(() => {
    if (!selectedUser) return;

    const loadUserPermissions = async () => {
      setIsLoading(true);
      try {
        // Get user's role-based permissions
        const defaultPermissions = getRolePermissions(selectedUser.role);
        
        // Get user's custom permissions
        const customPermissions = selectedUser.customPermissions || {};
        
        // Combine default and custom permissions
        const combinedPermissions: Record<string, boolean> = {};
        allPermissions.forEach(permission => {
          const hasRolePermission = defaultPermissions.includes(permission.key);
          const hasCustomPermission = customPermissions[permission.key];
          combinedPermissions[permission.key] = hasCustomPermission !== undefined 
            ? hasCustomPermission 
            : hasRolePermission;
        });

        setUserPermissions(combinedPermissions);
        setOriginalPermissions(combinedPermissions);
        setHasChanges(false);
      } catch (error) {
        console.error('Error loading user permissions:', error);
        toast.error('Failed to load user permissions');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, [selectedUser]);

  // Get default permissions for a role
  const getRolePermissions = (role: string): string[] => {
    const rolePermissions: Record<string, string[]> = {
      superadmin: Object.keys(FEATURE_PERMISSIONS),
      tenant_admin: [
        'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
        'assignTasks', 'viewInventory', 'manageInventory', 'viewUsers', 
        'manageUsers', 'viewReports', 'viewChat', 'view_damage_reports'
      ],
      property_manager: [
        'viewDashboard', 'viewProperties', 'viewAllTasks', 'assignTasks', 
        'viewInventory', 'viewReports', 'viewChat'
      ],
      housekeeping_staff: [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
      ],
      maintenance_staff: [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
      ],
      inventory_manager: [
        'viewDashboard', 'viewInventory', 'manageInventory', 'approveTransfers', 
        'viewReports', 'viewChat'
      ],
      concierge: [
        'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewChat'
      ]
    };
    
    return rolePermissions[role] || [];
  };

  // Toggle a permission
  const togglePermission = (permissionKey: string) => {
    if (!selectedUser) return;

    const newPermissions = {
      ...userPermissions,
      [permissionKey]: !userPermissions[permissionKey]
    };
    
    setUserPermissions(newPermissions);
    
    // Check if there are changes
    const hasChangesNow = Object.keys(newPermissions).some(
      key => newPermissions[key] !== originalPermissions[key]
    );
    setHasChanges(hasChangesNow);
  };

  // Save permissions
  const savePermissions = async () => {
    if (!selectedUser || !hasChanges) return;

    setIsLoading(true);
    try {
      // Calculate custom permissions (differences from role defaults)
      const roleDefaults = getRolePermissions(selectedUser.role);
      const customPermissions: Record<string, boolean> = {};
      
      Object.keys(userPermissions).forEach(key => {
        const hasRolePermission = roleDefaults.includes(key);
        const currentPermission = userPermissions[key];
        
        // Only store custom permissions that differ from role defaults
        if (currentPermission !== hasRolePermission) {
          customPermissions[key] = currentPermission;
        }
      });

      // Update user profile with custom permissions
      const { error } = await supabase
        .from('profiles')
        .update({ custom_permissions: customPermissions })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setOriginalPermissions(userPermissions);
      setHasChanges(false);
      toast.success('Permissions updated successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset permissions
  const resetPermissions = () => {
    setUserPermissions(originalPermissions);
    setHasChanges(false);
  };

  return {
    userPermissions,
    originalPermissions,
    allPermissions,
    permissionsByCategory,
    isLoading,
    hasChanges,
    togglePermission,
    savePermissions,
    resetPermissions,
    getRolePermissions
  };
};
