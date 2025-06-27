
import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserWithRoles } from "@/types/role-permission";
import { User } from "@/types/auth";

export class UserRoleService {
  static async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      throw new Error('Failed to fetch user roles');
    }

    return data || [];
  }

  static async getUsersWithRoles(): Promise<UserWithRoles[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        user_roles!inner (
          roles (*)
        )
      `);

    if (error) {
      console.error('Error fetching users with roles:', error);
      throw new Error('Failed to fetch users with roles');
    }

    return (data as any[]).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.user_roles?.map((ur: any) => ur.roles) || []
    }));
  }

  static async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('user_roles')
      .insert([{
        tenant_id: tenantId,
        user_id: userId,
        role_id: roleId,
        assigned_by: currentUser.user?.id
      }]);

    if (error) {
      console.error('Error assigning role to user:', error);
      throw new Error('Failed to assign role to user');
    }
  }

  static async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error revoking role from user:', error);
      throw new Error('Failed to revoke role from user');
    }
  }

  static async assignMultipleRolesToUser(userId: string, roleIds: string[], tenantId: string): Promise<void> {
    // First, remove existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleIds.length === 0) return;

    const { data: currentUser } = await supabase.auth.getUser();
    
    const userRoles = roleIds.map(roleId => ({
      tenant_id: tenantId,
      user_id: userId,
      role_id: roleId,
      assigned_by: currentUser.user?.id
    }));

    const { error } = await supabase
      .from('user_roles')
      .insert(userRoles);

    if (error) {
      console.error('Error assigning multiple roles to user:', error);
      throw new Error('Failed to assign roles to user');
    }
  }
}
