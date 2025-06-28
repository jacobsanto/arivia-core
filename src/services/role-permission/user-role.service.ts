
import { supabase } from "@/integrations/supabase/client";
import { UserWithRoles } from "@/types/role-permission";

export class UserRoleService {
  static async getUsersWithRoles(): Promise<UserWithRoles[]> {
    // Get users from profiles table with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch users');
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('is_active', true);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw new Error('Failed to fetch user roles');
    }

    // Combine data
    return (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: userRoles
        ?.filter(ur => ur.user_id === profile.id)
        ?.map(ur => ({
          id: ur.role,
          tenant_id: ur.tenant_id,
          name: ur.role,
          description: `${ur.role} role`,
          is_active: ur.is_active,
          created_at: ur.created_at,
          updated_at: ur.updated_at
        })) || []
    }));
  }

  static async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role: roleId,
        tenant_id: tenantId,
        is_active: true
      }]);

    if (error) {
      console.error('Error assigning role:', error);
      throw new Error('Failed to assign role to user');
    }
  }

  static async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', roleId);

    if (error) {
      console.error('Error revoking role:', error);
      throw new Error('Failed to revoke role from user');
    }
  }

  static async assignMultipleRolesToUser(userId: string, roleIds: string[], tenantId: string): Promise<void> {
    // First remove existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleIds.length > 0) {
      // Then assign new roles
      const roleInserts = roleIds.map(roleId => ({
        user_id: userId,
        role: roleId,
        tenant_id: tenantId,
        is_active: true
      }));

      const { error } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (error) {
        console.error('Error assigning multiple roles:', error);
        throw new Error('Failed to assign roles to user');
      }
    }
  }
}
