
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRoles } from '@/types/role-permission';
import { toast } from 'sonner';

export const useUserRoles = () => {
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsersWithRoles = async () => {
    try {
      setIsLoading(true);
      
      // Get users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Failed to fetch users');
        return;
      }

      // For now, return users with empty roles array since we're transitioning
      const users: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        roles: [] // Placeholder until RBAC is fully implemented
      }));

      setUsersWithRoles(users);
    } catch (error) {
      console.error('Error in fetchUsersWithRoles:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const assignMultipleRolesToUser = async (userId: string, roleIds: string[], tenantId: string) => {
    try {
      // Placeholder implementation - will be updated after schema migration
      console.warn('Role assignment temporarily disabled during RBAC transition');
      toast.info('Role assignment will be available soon');
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    }
  };

  const revokeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      // Placeholder implementation - will be updated after schema migration
      console.warn('Role revocation temporarily disabled during RBAC transition');
      toast.info('Role revocation will be available soon');
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error('Failed to revoke role');
    }
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  return {
    usersWithRoles,
    isLoading,
    assignMultipleRolesToUser,
    revokeRoleFromUser,
    refetch: fetchUsersWithRoles
  };
};
