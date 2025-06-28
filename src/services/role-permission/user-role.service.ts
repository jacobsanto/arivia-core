import { supabase } from "@/integrations/supabase/client";
import { UserWithRoles } from "@/types/role-permission";

export class UserRoleService {
  static async getUsersWithRoles(): Promise<UserWithRoles[]> {
    // Get users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch users');
    }

    // For now, return users with empty roles array since we're transitioning
    // This will be updated once the RBAC system is fully implemented
    return (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: [] // Placeholder until RBAC is fully implemented
    }));
  }

  static async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    // Placeholder implementation - will be updated after schema migration
    console.warn('Role assignment temporarily disabled during RBAC transition');
    throw new Error('Role assignment temporarily disabled during RBAC transition');
  }

  static async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // Placeholder implementation - will be updated after schema migration
    console.warn('Role revocation temporarily disabled during RBAC transition');
    throw new Error('Role revocation temporarily disabled during RBAC transition');
  }

  static async assignMultipleRolesToUser(userId: string, roleIds: string[], tenantId: string): Promise<void> {
    // Placeholder implementation - will be updated after schema migration
    console.warn('Multiple role assignment temporarily disabled during RBAC transition');
    throw new Error('Multiple role assignment temporarily disabled during RBAC transition');
  }
}
