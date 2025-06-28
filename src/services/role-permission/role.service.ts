
import { supabase } from "@/integrations/supabase/client";
import { Role, CreateRoleData, UpdateRoleData, RoleWithPermissions } from "@/types/role-permission";

export class RoleService {
  static async getRoles(): Promise<Role[]> {
    // Use the existing user_roles table structure
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }

    // Create mock Role objects from unique role names
    const uniqueRoles = [...new Set(data?.map(item => item.role) || [])];
    
    return uniqueRoles.map(roleName => ({
      id: roleName.toLowerCase().replace(/\s+/g, '-'),
      tenant_id: 'default-tenant-id',
      name: roleName,
      description: `${roleName} role`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  static async getRoleById(id: string): Promise<Role | null> {
    const roles = await this.getRoles();
    return roles.find(r => r.id === id) || null;
  }

  static async createRole(roleData: CreateRoleData): Promise<Role> {
    // For now, just return a mock role
    const newRole: Role = {
      id: Math.random().toString(36).substr(2, 9),
      ...roleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newRole;
  }

  static async updateRole(id: string, updates: UpdateRoleData): Promise<Role> {
    const existing = await this.getRoleById(id);
    if (!existing) {
      throw new Error('Role not found');
    }
    
    return {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
  }

  static async deleteRole(id: string): Promise<void> {
    console.log('Role deleted:', id);
  }

  static async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    console.log('Permissions assigned to role:', roleId, permissionIds);
  }

  static async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | null> {
    const role = await this.getRoleById(id);
    if (!role) return null;
    
    // Mock permissions for the role
    return {
      ...role,
      permissions: []
    };
  }
}
