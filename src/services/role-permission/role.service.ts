
import { supabase } from "@/integrations/supabase/client";
import { Role, CreateRoleData, UpdateRoleData, RoleWithPermissions } from "@/types/role-permission";

export class RoleService {
  static async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }

    return data || [];
  }

  static async getRoleById(id: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }

    return data;
  }

  static async createRole(roleData: CreateRoleData): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert([roleData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');
    }
    
    return data;
  }

  static async updateRole(id: string, updates: UpdateRoleData): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
    
    return data;
  }

  static async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting role:', error);
      throw new Error('Failed to delete role');
    }
  }

  static async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    // First, get the role to determine tenant_id
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Delete existing permissions for this role
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    // Insert new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        tenant_id: role.tenant_id,
        role_id: roleId,
        permission_id: permissionId
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (error) {
        console.error('Error assigning permissions:', error);
        throw new Error('Failed to assign permissions to role');
      }
    }
  }

  static async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | null> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions!inner(
          permissions(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching role with permissions:', error);
      return null;
    }

    // Transform the data to match our expected structure
    const permissions = data.role_permissions?.map((rp: any) => rp.permissions) || [];
    
    return {
      ...data,
      permissions
    };
  }
}
