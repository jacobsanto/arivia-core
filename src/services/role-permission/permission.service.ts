
import { supabase } from "@/integrations/supabase/client";
import { Permission, CreatePermissionData, UpdatePermissionData } from "@/types/role-permission";

export class PermissionService {
  static async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('is_active', true)
      .order('category, label');

    if (error) {
      console.error('Error fetching permissions:', error);
      throw new Error('Failed to fetch permissions');
    }

    return data || [];
  }

  static async getPermissionById(id: string): Promise<Permission | null> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching permission:', error);
      return null;
    }

    return data;
  }

  static async createPermission(permissionData: CreatePermissionData): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert([permissionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating permission:', error);
      throw new Error('Failed to create permission');
    }
    
    return data;
  }

  static async updatePermission(id: string, updates: UpdatePermissionData): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating permission:', error);
      throw new Error('Failed to update permission');
    }
    
    return data;
  }

  static async deletePermission(id: string): Promise<void> {
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting permission:', error);
      throw new Error('Failed to delete permission');
    }
  }

  static async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getPermissions();
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
}
