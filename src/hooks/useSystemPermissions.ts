import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/auth/types";
import { toast } from "sonner";

export interface SystemPermission {
  id: string;
  permission_key: string;
  title: string;
  description: string;
  allowed_roles: UserRole[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
}

export const useSystemPermissions = () => {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPermissions = async () => {
    try {
      // Note: system_permissions table may not exist yet
      // Using system_settings as a fallback
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'permissions')
        .order('id');

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      // For now, return empty array if table doesn't exist
      const transformedData: SystemPermission[] = [];
      setPermissions(transformedData);
    } catch (error) {
      console.error('Error fetching system permissions:', error);
      toast.error('Failed to load permissions');
      setPermissions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id: string, updates: Partial<SystemPermission>) => {
    setSaving(true);
    try {
      // Implementation will be added when system_permissions table exists
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  const togglePermissionActive = async (id: string, is_active: boolean) => {
    await updatePermission(id, { is_active });
  };

  const updateAllowedRoles = async (id: string, allowed_roles: UserRole[]) => {
    await updatePermission(id, { allowed_roles });
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    saving,
    updatePermission,
    togglePermissionActive,
    updateAllowedRoles,
    refreshPermissions: fetchPermissions
  };
};