
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRolePermissions = () => {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRolePermissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          role_id,
          permission:permissions(key)
        `);

      if (error) {
        console.error('Error fetching role permissions:', error);
        return;
      }

      // Group permissions by role_id
      const grouped = (data || []).reduce((acc, item) => {
        if (!acc[item.role_id]) {
          acc[item.role_id] = [];
        }
        if (item.permission?.key) {
          acc[item.role_id].push(item.permission.key);
        }
        return acc;
      }, {} as Record<string, string[]>);

      setRolePermissions(grouped);
    } catch (error) {
      console.error('Error in fetchRolePermissions:', error);
      toast.error('Failed to fetch role permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionsForRole = (roleId: string): string[] => {
    return rolePermissions[roleId] || [];
  };

  const togglePermissionForRole = async (roleId: string, permissionKey: string) => {
    try {
      const currentPermissions = getPermissionsForRole(roleId);
      const hasPermission = currentPermissions.includes(permissionKey);

      if (hasPermission) {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .match({ 
            role_id: roleId, 
            permission_id: await getPermissionId(permissionKey) 
          });

        if (error) throw error;
      } else {
        // Add permission
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: roleId,
            permission_id: await getPermissionId(permissionKey),
            tenant_id: crypto.randomUUID() // Using random UUID for now
          });

        if (error) throw error;
      }

      // Refresh role permissions
      await fetchRolePermissions();
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const getPermissionId = async (permissionKey: string): Promise<string> => {
    const { data, error } = await supabase
      .from('permissions')
      .select('id')
      .eq('key', permissionKey)
      .single();

    if (error || !data) {
      throw new Error(`Permission not found: ${permissionKey}`);
    }

    return data.id;
  };

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  return {
    rolePermissions,
    isLoading,
    getPermissionsForRole,
    togglePermissionForRole,
    refetch: fetchRolePermissions
  };
};
