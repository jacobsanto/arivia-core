import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  SystemPermission, 
  RolePermission, 
  PermissionMatrix, 
  PermissionCategory,
  AppRole 
} from '@/types/permissions.types';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [originalMatrix, setOriginalMatrix] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all permissions and role permissions
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system permissions
      const { data: systemPermissions, error: permError } = await supabase
        .from('system_permissions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('permission_name', { ascending: true });

      if (permError) throw permError;

      // Fetch role permissions
      const { data: rolePerms, error: roleError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('granted', true);

      if (roleError) throw roleError;

      setPermissions(systemPermissions || []);
      setRolePermissions(rolePerms || []);

      // Create permission matrix
      const matrix = createPermissionMatrix(systemPermissions || [], rolePerms || []);
      setPermissionMatrix(matrix);
      setOriginalMatrix(matrix);

    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      toast({
        title: "Error",
        description: "Failed to load permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create permission matrix from data
  const createPermissionMatrix = (
    systemPerms: SystemPermission[], 
    rolePerms: RolePermission[]
  ): PermissionMatrix => {
    const matrix: PermissionMatrix = {};
    const roles: AppRole[] = ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'guest'];

    systemPerms.forEach(permission => {
      matrix[permission.permission_key] = {} as { [role in AppRole]: boolean };
      
      roles.forEach(role => {
        const hasPermission = rolePerms.some(
          rp => rp.role === role && rp.permission_key === permission.permission_key
        );
        matrix[permission.permission_key][role] = hasPermission;
      });
    });

    return matrix;
  };

  // Group permissions by category
  const getPermissionsByCategory = useCallback((): PermissionCategory[] => {
    const categories: { [key: string]: SystemPermission[] } = {};
    
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });

    return Object.entries(categories).map(([category, perms]) => ({
      category,
      permissions: perms
    }));
  }, [permissions]);

  // Toggle permission for a role
  const togglePermission = useCallback((permissionKey: string, role: AppRole) => {
    // Don't allow changes to superadmin role - it's always fully privileged
    if (role === 'superadmin') return;

    setPermissionMatrix(prev => ({
      ...prev,
      [permissionKey]: {
        ...prev[permissionKey],
        [role]: !prev[permissionKey][role]
      }
    }));
  }, []);

  // Check if there are unsaved changes
  const hasChanges = useCallback((): boolean => {
    return JSON.stringify(permissionMatrix) !== JSON.stringify(originalMatrix);
  }, [permissionMatrix, originalMatrix]);

  // Save permission changes
  const savePermissions = useCallback(async () => {
    if (!hasChanges()) return;

    try {
      setSaving(true);
      
      // Prepare updates
      const updates: Array<{ role: AppRole; permission_key: string; granted: boolean }> = [];
      
      Object.entries(permissionMatrix).forEach(([permissionKey, rolePerms]) => {
        Object.entries(rolePerms).forEach(([role, granted]) => {
          const originalGranted = originalMatrix[permissionKey]?.[role as AppRole] || false;
          if (granted !== originalGranted) {
            updates.push({
              role: role as AppRole,
              permission_key: permissionKey,
              granted
            });
          }
        });
      });

      // Execute updates
      for (const update of updates) {
        if (update.granted) {
          // Insert or update to granted
          const { error } = await supabase
            .from('role_permissions')
            .upsert({
              role: update.role,
              permission_key: update.permission_key,
              granted: true
            }, {
              onConflict: 'role,permission_key'
            });
          
          if (error) throw error;
        } else {
          // Delete the permission (or update to not granted)
          const { error } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role', update.role)
            .eq('permission_key', update.permission_key);
          
          if (error) throw error;
        }
      }

      // Update the original matrix to reflect saved state
      setOriginalMatrix({ ...permissionMatrix });

      toast({
        title: "Success",
        description: "Permissions updated successfully.",
      });

    } catch (err) {
      console.error('Error saving permissions:', err);
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [permissionMatrix, originalMatrix, hasChanges]);

  // Reset to original state
  const resetPermissions = useCallback(() => {
    setPermissionMatrix({ ...originalMatrix });
  }, [originalMatrix]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    permissionMatrix,
    loading,
    saving,
    error,
    hasChanges: hasChanges(),
    getPermissionsByCategory,
    togglePermission,
    savePermissions,
    resetPermissions,
    fetchPermissions
  };
};