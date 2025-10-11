import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
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
      const { data, error } = await (supabase as any)
        .from('system_permissions')
        .select('*')
        .order('permission_key');

      if (error) throw error;
      
      // Transform the data to ensure proper typing (using type assertion for fields not in generated types)
      const transformedData: SystemPermission[] = (data || []).map((item: any) => ({
        id: item.id,
        permission_key: item.permission_key,
        title: item.permission_name || item.title || '',
        description: item.description,
        allowed_roles: (item.allowed_roles || []) as UserRole[],
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        modified_by: item.modified_by || null
      }));
      
      setPermissions(transformedData);
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id: string, updates: Partial<SystemPermission>) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('system_permissions')
        .update({
          ...updates,
          modified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPermissions(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));

      toast.success('Permission updated successfully');
    } catch (error) {
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