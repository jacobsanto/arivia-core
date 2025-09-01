import { supabase } from '@/integrations/supabase/client';
import { SystemPermission, CreatePermissionData, UpdatePermissionData } from '@/types/permissions.types';

export const permissionsService = {
  async getPermissions(): Promise<SystemPermission[]> {
    const { data, error } = await supabase
      .from('system_permissions')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('permission_name', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }

    return data || [];
  },

  async getAllPermissions(): Promise<SystemPermission[]> {
    const { data, error } = await supabase
      .from('system_permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('permission_name', { ascending: true });

    if (error) {
      console.error('Error fetching all permissions:', error);
      throw error;
    }

    return data || [];
  },

  async getPermissionsByCategory(category: string): Promise<SystemPermission[]> {
    const { data, error } = await supabase
      .from('system_permissions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('permission_name', { ascending: true });

    if (error) {
      console.error('Error fetching permissions by category:', error);
      throw error;
    }

    return data || [];
  },

  async createPermission(permissionData: CreatePermissionData): Promise<SystemPermission> {
    const { data, error } = await supabase
      .from('system_permissions')
      .insert(permissionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating permission:', error);
      throw error;
    }

    return data;
  },

  async updatePermission(id: string, updates: UpdatePermissionData): Promise<SystemPermission> {
    const { data, error } = await supabase
      .from('system_permissions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating permission:', error);
      throw error;
    }

    return data;
  },

  async deletePermission(id: string): Promise<void> {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('system_permissions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  }
};